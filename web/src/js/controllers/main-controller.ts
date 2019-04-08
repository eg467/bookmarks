import { BookmarkApi } from "../models/pocket-api";
import ResultsController from "./results-controller";
import FilterModel from "../models/filter-model";
import { MenuController } from "./menu-controller";
import { SettingsController } from "./settings-controller";
import SelectedItems from "../models/selected-items";
import BulkEditController from "./bulk-edit-controller";
import { throws } from "assert";
import { GlobalSettings } from "../models/global-settings";

export class MainController {
   private controllers: {
      menuController: MenuController;
      bulkEditController: BulkEditController;
      resultsController: ResultsController;
      settingsController: SettingsController;
   };

   constructor(public api: BookmarkApi, public filterModel: FilterModel) {
      this.api.dataSourceChangedEvent.subscribe((s, _) => {
         $(document.body).applyClass("readonly", s.readonly);
      }, true);

      const selectedBookmarks = new SelectedItems();

      this.controllers = {
         menuController: new MenuController(
            api,
            filterModel,
            selectedBookmarks,
            {}
         ),

         bulkEditController: new BulkEditController(
            api,
            filterModel,
            selectedBookmarks
         ),

         resultsController: new ResultsController(
            this.api,
            this.filterModel,
            selectedBookmarks,
            {}
         ),

         settingsController: new SettingsController(
            this.api,
            this.filterModel,
            selectedBookmarks
         )
      };

      this.api.retrieveEvent.subscribe((sender, args) => {
         $("#loading-container").hide();
      }, true);

      this.initializeSettings();
   }

   private initializeSettings() {
      GlobalSettings.setting("full-summaries", true);
      GlobalSettings.setting("block-listings", false);
   }
}
