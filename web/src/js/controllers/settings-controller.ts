import {
   BookmarkApi,
   ApiFactory,
   ResultDataSource
} from "../models/pocket-api";
import { Bookmarks } from "../models/Bookmarks";
import FilterModel from "../models/filter-model";
import { SettingsView } from "../views/settings-view";
import {
   LinkSyncer,
   MyJsonStore,
   StoredLinks,
   FirefoxConverter,
   FirefoxConverterOptions,
   MyJsonConverter
} from "../models/bookmark-converter";
import { download, toast } from "../utils";

export class SettingsController {
   syncer: LinkSyncer;
   private view: SettingsView;

   constructor(
      private pocketApi: BookmarkApi,
      private filterModel: FilterModel
   ) {
      this.syncer = new LinkSyncer(this.pocketApi, new MyJsonStore());
      this.view = new SettingsView(this, {
         $root: $("#conversions")
      });

      this.syncer.syncEvent.subscribe((s, args) => {
         toast("Completed", {
            title: "Bookmark Sync",
            type: "success"
         });
      });
   }

   get synced() {
      return this.syncer.enabled;
   }
   set synced(value: boolean) {
      try {
         this.syncer.enabled = value;
         if (value) {
            this.syncer.forceUpdate(this.filterModel.fullResults);
         }
      } catch (e) {
         console.error(e);
         toast(e.message, { type: "danger", title: "Error" });
         this.syncer.enabled = false;
      }
      this.view.updateSyncerDisplay();
   }

   async importFromMyJson(key: string, toReadOnly: boolean) {
      if (toReadOnly) {
         window.location.href = "?mode=myjson&key=" + key;
      }

      const converter = new MyJsonConverter();
      const storedLinks = await converter.import(key);
      const results = Bookmarks.fromMetadata(storedLinks.bookmarks);
      await this.importToCurrentApi(results);
   }

   async exportToMyJson() {
      const username = this.pocketApi.username;
      const results = this.filterModel.fullResults;
      const sl = new StoredLinks(username, results);
      const converter = new MyJsonConverter();
      const key = await converter.export(sl, null);
      this.view.exportedToMyJson(key);
      toast("Completed", {
         title: "Export",
         type: "success"
      });
   }

   async exportToFirefox(options: FirefoxConverterOptions) {
      const converter = new FirefoxConverter();
      const html = converter.export(this.filterModel.fullResults, options);
      download("Bookmarks.html", html);
      toast("Completed", {
         title: "Export",
         type: "success"
      });
   }

   async importFromFirefox(
      json: string,
      toReadOnly: boolean,
      options: FirefoxConverterOptions
   ) {
      const converter = new FirefoxConverter();
      const metadata = converter.import(json, options);
      const results = Bookmarks.fromMetadata(metadata);
      await this.importToSource(
         results,
         toReadOnly,
         "User",
         "Firefox Bookmarks"
      );
   }

   private async importToSource(
      results: Bookmarks,
      toReadOnly: boolean,
      username: string,
      sourceLabel: string
   ) {
      if (this.pocketApi.readonly || toReadOnly) {
         this.loadReadOnly(results, username, sourceLabel);
      } else {
         await this.importToCurrentApi(results);
      }
   }

   private async loadReadOnly(
      results: Bookmarks,
      username: string,
      sourceLabel: string
   ) {
      const ds = new ResultDataSource(results, username, sourceLabel);
      this.pocketApi.dataSource = ds;
      await this.pocketApi.retrieve({});
      toast("Import", {
         title: "complete",
         type: "success"
      });
   }

   private async importToCurrentApi(results: Bookmarks) {
      const editor = this.pocketApi.createEditor();
      await editor.importFromMetadata(results.linkMetadata());
      await this.pocketApi.retrieve({});
      toast("Import", {
         title: "complete",
         type: "success"
      });
   }
}
