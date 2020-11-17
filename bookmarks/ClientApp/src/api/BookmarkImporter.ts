import { BookmarkCollection, BookmarkData } from "../redux/bookmarks/bookmarks";
import { standardizeTags } from "../redux/bookmarks/reducer";

export class BookmarkImporter {
   private readonly bookmarkList: BookmarkData[] = [];

   private static throwParsingError(exception: any): void {
      console.error(exception);
      throw Error("Invalid bookmark data.");
   }

   private static urlCheckingAnchor = window.document.createElement("a");

   private static isUrl(url: string): boolean {
      BookmarkImporter.urlCheckingAnchor.href = url;
      return !!BookmarkImporter.urlCheckingAnchor.host;
   }

   private static BookmarkDataFromAny(data: any): BookmarkData {
      let {
         id = "",
         url = "",
         title = "",
         tags = [],
         added,
      } = data;

      // noinspection SuspiciousTypeOfGuard
      if (
         !url ||
         typeof url !== "string" ||
         !BookmarkImporter.isUrl(url)) {
         BookmarkImporter.throwParsingError(Error(`${url} is not a valid URL.`));
      }
      
      if(typeof title !== "string") {
         BookmarkImporter.throwParsingError(Error(`title: '${title}' is not a string.`));
      }
      
      if(!tags) {
         tags = [] as string[];
      }
      else if(typeof tags === "string") {
         tags = tags.split(",");
      }
      else if(!Array.isArray(tags) || tags.some((t) => typeof t !== "string")) {
         BookmarkImporter.throwParsingError(Error(`tags ${tags} is not an array`));
      }
      
      if(typeof added !== "number") {
         added = new Date().getTime();
      }

      tags = standardizeTags(tags);
      return { id, url, title, tags, added };
   }

   public addUrl(url: string): void {
      const bookmark = BookmarkImporter.BookmarkDataFromAny({ url });
      this.add(bookmark);
   }

   public addUrls(urls: string[]): void {
      urls.forEach(this.addUrl);
   }

   public add(bookmark: BookmarkData): void {
      this.bookmarkList.push(bookmark);
   }

   public clear(): void {
      this.bookmarkList.length = 0;
   }

   public addJson(json: string): void {
      let parsed: any;
      try {
         parsed = JSON.parse(json);
      } catch {
         parsed = false;
      }

      const fromObjects = (objs: any[]): void => {
         objs.map(BookmarkImporter.BookmarkDataFromAny).forEach(b => this.add(b));
      };

      if (Array.isArray(parsed)) {
         if (parsed.every((x: any) => typeof x === "string")) {
            // serialized string[] of URLs
            this.addUrls(parsed);
         } else {
            // Either BookmarkData[] or <Invalid>[]
            fromObjects(parsed);
         }
      } else if (typeof parsed === "object") {
         // serialized BookmarkCollection
         fromObjects(Object.values(parsed));
      } else {
         BookmarkImporter.throwParsingError(Error("Bookmarks are not of the correct type. Ensure object property names are quoted."));
      }
   }

   private fillIds(): void {
      // If any ids are missing, rewrite them all
      if (this.bookmarkList.some((b) => !b.id)) {
         this.bookmarkList.forEach((v, i) => {
            v.id = String(i).padStart(4, "0");
         });
      }
   }

   public get collection(): BookmarkCollection {
      this.fillIds();
      return this.bookmarkList.reduce((acc: BookmarkCollection, val) => {
         acc[val.id] = val;
         return acc;
      }, {} as BookmarkCollection);
   }
}
