import { View, IViewSettings, TypedEvent } from "./view";
import { FilterTagView, FilterTextView } from "./filter-views";
import { MenuController } from "../controllers/menu-controller";

import FilterModel, { TagFilter } from "../models/filter-model";
import { GlobalSettings } from "../models/global-settings";

export class MenuView extends View {
   andFilterView: FilterTagView;
   orFilterView: FilterTagView;
   notFilterView: FilterTagView;
   contentFilterView: FilterTextView;
   $logout: JQuery<HTMLElement>;

   constructor(
      private controller: MenuController,
      private filterModel: FilterModel,
      settings: IViewSettings = {}
   ) {
      super(settings);

      this.addSubViews();
      this.wireEventHandlers();
   }

   protected $createRoot() {
      return $(".navbar");
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

   get fullSummaries() {
      return $("#cb-show-full-summaries").is("#checked");
   }
   set fullSummaries(value: boolean) {
      $("#cb-show-full-summaries").prop("checked", value);
   }
   get blockListings() {
      return $("#cb-show-block-listings").is(":checked");
   }
   set blockListings(value: boolean) {
      $("#cb-show-block-listings").prop("checked", value);
   }

   private wireEventHandlers() {
      // Input events
      //$(".dropdown-menu div").btnclick(_ => {}, true, true);

      $("#refresh-links").btnclick(() => this.controller.refreshResults());

      $("#btn-clear-filters").btnclick(() => this.controller.resetFilters());

      $("#btn-show-settings").btnclick(_ => {
         $("#settings-modal").modal({});
      });

      $("#cb-show-full-details").change((e: JQuery.ChangeEvent) => {
         new Promise(res => {
            const value = (e.target as HTMLInputElement).checked;
            GlobalSettings.setting("full-summaries", value);
            res();
         });
      });

      $("#cb-show-block-listings").change((e: JQuery.ChangeEvent) => {
         new Promise(res => {
            const value = (e.target as HTMLInputElement).checked;
            GlobalSettings.setting("block-listings", value);
            res();
         });
      });

      // Model events
      this.filterModel.resultsChangedEvent.subscribe(
         this.resultsChanged.bind(this)
      );

      GlobalSettings.settingChangedEvent.subscribe((sender, args) => {
         if (args.key === "full-summaries") {
            this.fullSummaries = args.value;
         } else if (args.key === "block-listings") {
            this.blockListings = args.value;
         }
      });
   }

   resultsChanged(sender: FilterModel) {
      this.updateFilterView(this.andFilterView, sender.filters.and);
      this.updateFilterView(this.orFilterView, sender.filters.or);
      this.updateFilterView(this.notFilterView, sender.filters.not);
   }

   private updateFilterView(view: FilterTagView, filter: TagFilter) {
      view.whitelist = filter.whitelist;
      view.blacklist = filter.blacklist;
   }
}
