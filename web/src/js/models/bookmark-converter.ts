import {
   BookmarkApi,
   ILinkData,
   IRetrieveEventArgs,
   IActionEventArgs,
   ILinkMetadata
} from "./pocket-api";
import { Bookmarks } from "./Bookmarks";

import { TypedEvent } from "../views/view";
import { toast } from "../utils";

export interface IStoredLinks {
   date_created: number;
   bookmarks: ILinkMetadata[];
   creator: string;
   title: string;
}

export class StoredLinks implements IStoredLinks {
   date_created: number;
   public bookmarks: ILinkData[];

   constructor(
      public creator: string,
      results: Bookmarks,
      public title = "My Bookmarks"
   ) {
      this.date_created = Math.round(new Date().getTime() / 1000);
      this.bookmarks = results.links.map(
         b =>
            <ILinkData>{
               tags: b.tags,
               time_added: b.time_added,
               resolved_url: b.resolved_url,
               given_title: b.given_title
            }
      );
   }
}

export interface ILinkStore {
   read(key: string): Promise<any>;
   write(data: any): Promise<string>;
   update(key: string, data: any): Promise<void>;
}

/**
 * A JSON store that uses MyJson.com as a backend.
 */
export class MyJsonStore implements ILinkStore {
   /**
    *
    * @param key Either the full myjson.com URL or just the object id
    */
   async read(key: string) {
      if (!key.match(/^https?:/i)) {
         key = `https://api.myjson.com/bins/${encodeURIComponent(key)}`;
      }

      return await $.get(key, { crossDomain: true });
   }

   async write(data: any) {
      data.date_created = Math.round(new Date().getTime() / 1000);

      const response = await $.ajax({
         url: "https://api.myjson.com/bins",
         type: "POST",
         crossDomain: true,
         data: JSON.stringify(data),
         contentType: "application/json; charset=utf-8",
         dataType: "json"
      });

      return (<string>response.uri).split("/").pop();
   }

   async update(key: string, data: any) {
      data.date_created = Math.round(new Date().getTime() / 1000);

      await $.ajax({
         url: `https://api.myjson.com/bins/${key}`,
         type: "PUT",
         crossDomain: true,
         data: JSON.stringify(data),
         contentType: "application/json; charset=utf-8",
         dataType: "json"
      });
   }
}

/**
 * Syncs pocket API to a remote JSON Store
 */
export class LinkSyncer {
   public syncEvent = new TypedEvent<LinkSyncer, void>(this);

   private apiRetrievalCallback: (
      sender: BookmarkApi,
      args: IRetrieveEventArgs
   ) => void;

   private apiActionCallback: (
      sender: BookmarkApi,
      args: IActionEventArgs
   ) => void;

   get key() {
      return localStorage.getItem("sync_key");
   }
   set key(value: string) {
      localStorage.setItem("sync_key", value);
   }

   get enabled() {
      return !this.api.readonly && localStorage.getItem("sync_enabled") === "1";
   }
   set enabled(value: boolean) {
      if (value && this.api.readonly) {
         throw new Error("Syncing doesn't work with read-only data sources.");
      }
      localStorage.setItem("sync_enabled", value ? "1" : "0");
   }

   private readonly converter: StoreConverter;
   constructor(private readonly api: BookmarkApi, store: ILinkStore) {
      this.createCallbacks();
      this.wireCallbacks();
      this.converter = new StoreConverter(store);
   }

   private async apiRetrieval(sender: BookmarkApi, args: IRetrieveEventArgs) {
      if (this.enabled) {
         await this.saveResults(args.results);
      }
   }

   public async forceUpdate(results: Bookmarks) {
      await this.saveResults(results);
   }

   public async apiAction(sender: BookmarkApi, args: IActionEventArgs) {
      if (!this.enabled || !containsImportantChanges()) {
         return;
      }

      // Perform a new retrieval
      const newApi = this.api.clone();
      const results = await newApi.retrieve({});
      await this.saveResults(results);

      // HELPERS
      function containsImportantChanges() {
         // Ignore unimportant actions, e.g. favoriting and archiving.
         return args.actions.some(a =>
            /^(add|remove|tags_.+)$/i.test(a.action)
         );
      }
   }

   private async saveResults(results: Bookmarks) {
      if (this.api.readonly) {
         toast("Only editable pocket accounts can sync bookmarks.", {
            title: "Error",
            type: "danger"
         });
         console.error("Only editable pocket accounts can sync bookmarks.");
         return;
      }

      const storedLinks = new StoredLinks(
         this.api.username,
         results,
         "Synced Bookmarks"
      );
      this.key = await this.converter.export(storedLinks, this.key);
      this.syncEvent.trigger();
   }

   private createCallbacks() {
      this.apiActionCallback = this.apiAction.bind(this);
      this.apiRetrievalCallback = this.apiRetrieval.bind(this);
   }

   private wireCallbacks() {
      this.api.actionEvent.subscribe(this.apiActionCallback);
      this.api.retrieveEvent.subscribe(this.apiRetrievalCallback, true);
   }

   private unwireCallbacks() {
      this.api.actionEvent.unsubscribe(this.apiActionCallback);
      this.api.retrieveEvent.unsubscribe(this.apiRetrievalCallback);
   }

   destroy() {
      this.unwireCallbacks();
   }
}

export type FirefoxConverterOptions = {
   treatTagsAsFolders?: boolean;
   useOriginalTime?: boolean;
};
export class FirefoxConverter {
   /**
    * Returns a list of metadata from firefox browser
    * @param json JSON generated from the firefox bookmark backup menu
    * @param options
    */
   import(json: string, options: FirefoxConverterOptions) {
      const data = JSON.parse(json);
      return jsonRead(data, "", []);

      // HELPER FUNCTIONS

      function jsonRead(
         item: any,
         currentDirPath: string,
         results: ILinkMetadata[]
      ) {
         if (item.type === "text/x-moz-place") {
            results.push({
               given_title: item.title || undefined,
               resolved_url: item.uri,
               tags: item.tags || "" ? item.tags.split(",") : [],
               time_added: options.useOriginalTime ? item.dateAdded : undefined
            });
         } else if (Array.isArray(item.children)) {
            if (item.title) {
               currentDirPath += sanitizeTag(item.title) + ",";
            }

            for (const child in item.children) {
               jsonRead(child, currentDirPath, results);
            }
         }

         return results;
      }

      function sanitizeTag(tag: string) {
         return tag.replace(/[^\s-_a-zA-Z0-9]/gi, "_").toLowerCase();
      }
   }

   /**
    * Returns HTML that can be imported into firefox to create browser bookmarks.
    * @param bookmarks
    * @param options
    */
   export(bookmarks: Bookmarks, options: FirefoxConverterOptions) {
      const rootDir = "Synced Pocket Bookmarks";
      if (options.treatTagsAsFolders) {
         return exportInTagFolders(bookmarks, rootDir);
      } else {
         return exportInOneFolder(bookmarks.linkMetadata(), rootDir);
      }

      // HELPER FUNCTIONS

      function exportInTagFolders(results: Bookmarks, dir: string) {
         const html: string[] = [];
         html.push(exportHeader());
         html.push(exportFolder(dir));

         for (const tag of Object.keys(results.tags)) {
            html.push(exportFolder(tag));
            const items = results.tags[tag].map(id => results.items[id]);
            html.push(...exportLinks(items, options.useOriginalTime));
         }

         html.push(exportFooter());
         return html.join("");
      }

      function exportInOneFolder(links: ILinkMetadata[], rootFolder: string) {
         const html: string[] = [];
         html.push(exportHeader());
         html.push(exportFolder(rootFolder));
         html.push(...exportLinks(links, options.useOriginalTime));
         html.push(exportFooter());
         return html.join("");
      }

      function exportLinks(links: ILinkMetadata[], useOriginalTime: boolean) {
         const html: string[] = [];
         html.push(`<DL><p>`);
         html.push(...links.map(exportLink));
         html.push(`</DL>`);
         return html;
      }

      function exportHeader() {
         return `<!DOCTYPE NETSCAPE-Bookmark-file-1>
            <META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
            <TITLE>Bookmarks</TITLE>
            <H1>Bookmarks Menu</H1>
            <DL>
            `;
      }

      function exportFooter() {
         return `</DL>`;
      }

      function exportFolder(dir: string) {
         return `
            <p>
               <DT>
                  <H3>${dir}</H3>
            `;
      }

      function exportLink(link: ILinkMetadata) {
         const time = getTime(link, options.useOriginalTime);
         return `
         <DT><A HREF="${
            link.resolved_url
         }" ADD_DATE="${time}" LAST_MODIFIED="${time}"
            TAGS="${link.tags.join()}">${escapeHtml(link.given_title)}</A>`;
      }
   }
}

export type MyJsonConverterOptions = {};
/**
 * A Converter that goes directly to JSON.
 */
export class StoreConverter {
   constructor(private store: ILinkStore) {}

   async import(key: string) {
      return <IStoredLinks>await this.store.read(key);
   }

   /**
    * @param links The links to save
    * @param key null to create, string to update.
    */
   async export(links: IStoredLinks, key: string = null) {
      if (!key) {
         key = await this.store.write(links);
      } else {
         await this.store.update(key, links);
      }
      return key;
   }
}

export class MyJsonConverter extends StoreConverter {
   constructor() {
      super(new MyJsonStore());
   }
}

export class JsonConverter {
   /**
    *
    * @param json IStoredLink[] in JSON string form
    */
   import(json: string) {
      return <IStoredLinks>JSON.parse(json);
   }
   export(links: StoredLinks) {
      return JSON.stringify(links);
   }
}

function getTime(link: ILinkData, useOriginalTime: boolean) {
   const time = useOriginalTime ? link.time_added : new Date().getTime();
   return Math.round(time / 1000);
}

function unescapeHtml(t: string) {
   return $("<span>")
      .html(t)
      .text();
}

function escapeHtml(t: string) {
   return $("<span>")
      .text(t)
      .html();
}
