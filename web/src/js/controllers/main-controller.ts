import { BookmarkApi } from "../models/pocket-api";
import ResultsController from "./results-controller";
import FilterModel from "../models/filter-model";
import { MenuController } from "./menu-controller";
import { SettingsController } from "./settings-controller";
import SelectedItems from "../models/selected-items";
import BulkEditController from "./bulk-edit-controller";

export class MainController {
   private controllers: { [key: string]: any } = {};

   constructor(public api: BookmarkApi, public filterModel: FilterModel) {
      this.api.dataSourceChangedEvent.subscribe((s, _) => {
         $(document.body).applyClass("readonly", s.readonly);
      }, true);

      const selectedBookmarks = new SelectedItems();

      this.controllers.filterMenu = new MenuController(
         api,
         filterModel,
         selectedBookmarks,
         {}
      );

      this.controllers.bulkEditController = new BulkEditController(
         api,
         filterModel,
         selectedBookmarks
      );

      this.controllers.resultsController = new ResultsController(
         this.api,
         this.filterModel,
         selectedBookmarks,
         {}
      );

      this.controllers.settingsController = new SettingsController(
         this.api,
         this.filterModel,
         selectedBookmarks
      );

      // $(".navbar-toggler").btnclick(_ => {
      //    $("#navbarCollapse").toggleClass("collapse");
      // });

      this.api.retrieveEvent.subscribe((sender, args) => {
         $("#loading-container").hide();
      }, true);
   }
}
