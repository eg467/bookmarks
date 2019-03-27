import { View, IViewSettings } from "./view";
import {
   FilterTagView,
   FilterTextView,
   IFilterViewSettings
} from "./filter-views";
import { MenuController } from "../controllers/menu-controller";
import FilterModel from "../models/filter-model";

export class MenuView extends View {
   andFilterView: FilterTagView;
   orFilterView: FilterTagView;
   notFilterView: FilterTagView;
   contentFilterView: FilterTextView;
   $logout: JQuery<HTMLElement>;

   constructor(
      private controller: MenuController,
      private filterModel: FilterModel,
      settings: IViewSettings
   ) {
      super(settings);

      this.addSubViews();
      this.wireEventHandlers();
   }

   get username() {
      return $("#current-user").text();
   }
   set username(value: string) {
      $("#current-user").text(value);
   }

   get dataSource() {
      return $("#api-label").text();
   }
   set dataSource(value: string) {
      $("#api-label").text(value ? `[${value}]` : "");
   }

   addSubViews() {
      this.andFilterView = new FilterTagView(this.controller, "and", {
         $root: $("#filter-and-tags"),
         placeholder: "Required Tags",
         list: "popover"
      });

      this.orFilterView = new FilterTagView(this.controller, "or", {
         $root: $("#filter-or-tags"),
         placeholder: "Include Tags",
         list: "list"
      });

      this.notFilterView = new FilterTagView(this.controller, "not", {
         $root: $("#filter-not-tags"),
         placeholder: "Exclude Tags",
         list: "list"
      });

      this.contentFilterView = new FilterTextView(this.controller, "content", {
         $root: $("#filter-content"),
         placeholder: "Search Content"
      });
   }

   private wireEventHandlers() {
      // Input events
      //$(".dropdown-menu div").btnclick(_ => {}, true, true);

      $("#refresh-links").btnclick(() => this.controller.refreshResults());

      $("#btn-clear-filters").btnclick(() => this.controller.resetFilters());

      $("#btn-show-settings").btnclick(_ => {
         $("#settings-modal").modal({});
      });

      // Model events
      this.filterModel.resultsChangedEvent.subscribe(
         this.resultsChanged.bind(this)
      );
   }

   resultsChanged(sender: FilterModel) {
      this.andFilterView.whitelist = sender.filters.and.whitelist;
      this.andFilterView.blacklist = sender.filters.and.blacklist;
      this.orFilterView.whitelist = sender.filters.or.whitelist;
      this.orFilterView.blacklist = sender.filters.or.blacklist;
      this.notFilterView.whitelist = sender.filters.not.whitelist;
      this.notFilterView.blacklist = sender.filters.not.blacklist;
   }
}
