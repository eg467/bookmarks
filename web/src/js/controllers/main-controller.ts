import { BookmarkApi } from "../models/pocket-api";
import ResultsController from "./results-controller";
import FilterModel from "../models/filter-model";
import { MenuController } from "./menu-controller";
import { SettingsController } from "./settings-controller";

export class MainController {
   private controllers: { [key: string]: any } = {};

   constructor(public api: BookmarkApi, public filterModel: FilterModel) {
      this.api.dataSourceChangedEvent.subscribe((s, _) => {
         $(document.body).applyClass("readonly", s.readonly);
      }, true);

      this.controllers.filterMenu = new MenuController(api, filterModel, {});
      this.controllers.resultsController = new ResultsController(
         this.api,
         this.filterModel,
         {}
      );

      this.controllers.settingsController = new SettingsController(
         this.api,
         this.filterModel
      );

      this.api.retrieve({});

      // I don't know why this isn't working automatically with just HTML.
      $(".navbar-toggler").btnclick(_ => {
         $("#navbarCollapse").toggleClass("collapse");
      });

      this.api.retrieveEvent.subscribe((sender, args) => {
         $("#loading-container").hide();
      });
   }
}
