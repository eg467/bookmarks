import { def } from "../utils";
import { ILinkData, ILinkMetadata } from "./pocket-api";
export class Bookmarks {
   public tags: {
      [tagName: string]: string[];
   };
   private _linkList: ILinkData[];
   private _tagList: string[];
   private static counter = 0;
   /**
    *
    * @param {Function} refreshResults
    */
   constructor(
      public items: {
         [item_id: string]: ILinkData;
      }
   ) {
      // Convert ensure required fields exist usable results
      $.each(items, (key: string, item: ILinkData) => {
         def(item, "tags", []);
         def(item, "item_id", key);
      });
      this.tags = this.findTags();
   }

   static nextId() {
      return "id_" + ++Bookmarks.counter;
   }

   static fromMetadata(links: ILinkMetadata[]) {
      const items: {
         [item_id: string]: ILinkData;
      } = {};
      links.forEach(l => {
         const item_id = def(l, "item_id", () => Bookmarks.nextId());
         items[item_id] = l;
      });
      return new Bookmarks(items);
   }

   linkMetadata() {
      return this.links.map(
         l =>
            <ILinkMetadata>{
               given_title: l.given_title,
               resolved_url: l.resolved_url,
               tags: l.tags || [],
               time_added: l.time_added
            }
      );
   }

   /**
    * Returns a new result set containing only the items with the spcified ids.
    */
   filterIds(ids: string[] | Set<string>) {
      const newItems: {
         [key: string]: ILinkData;
      } = {};
      for (let id of ids) {
         newItems[id] = this.items[id];
      }
      return new Bookmarks(newItems);
   }

   private findTags() {
      const tags: {
         [tagName: string]: string[];
      } = {};
      $.each(this.items, (item_id: string, item: ILinkData) => {
         item.tags.forEach(tagKey => {
            const list = def(tags, tagKey, []);
            list.push(item_id);
         });
      });
      return tags;
   }

   /**
    * Finds all the tags of the given itemIds
    * @param [string|object[]] items A list of either item_id strings, or item objects
    */
   tagsByIds(ids: string[] | Set<string>) {
      const allTags = new Set();
      for (let id of ids) {
         this.items[id].tags.forEach(t => allTags.add(t));
      }
      return allTags;
   }

   linksByTag(tag: string) {
      return new Set(
         this.tags.hasOwnProperty(tag)
            ? this.tags[tag].map(id => this.items[id])
            : []
      );
   }

   get links() {
      return (
         this._linkList ||
         (this._linkList = Object.keys(this.items).map(k => this.items[k]))
      );
   }

   get tagList() {
      return this._tagList || (this._tagList = Object.keys(this.tags).sort());
   }
}
