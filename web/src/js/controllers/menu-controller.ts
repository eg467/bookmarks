import FilterModel from "../models/filter-model";
import { BookmarkApi, ApiFactory } from "../models/pocket-api";
import { FilterTextView, FilterTagView } from "../views/filter-views";
import { MenuView } from "../views/menu-view";
import { SettingsController } from "./settings-controller";
import SelectedItems from "../models/selected-items";

export class MenuController {
   //public filterViews: { [key: string]: FilterView };

   private menuView: MenuView;

   constructor(
      public pocketApi: BookmarkApi,
      public filterModel: FilterModel,
      public selectedBookmarks: SelectedItems,
      public settings: any
   ) {
      this.menuView = new MenuView(this, this.filterModel);
      this.updateUser();
   }

   filterQueryChanged(sender: FilterTagView | FilterTextView) {
      this.filterModel.applyFilter(sender.key, sender.value);
   }

   resetFilters() {
      this.menuView.andFilterView.value = [];
      this.menuView.orFilterView.value = [];
      this.menuView.notFilterView.value = [];
      this.menuView.contentFilterView.value = "";
   }

   public async refreshResults() {
      await this.pocketApi.retrieve({});
   }

   private updateUser() {
      this.menuView.dataSource = this.pocketApi.dataSource.label;
      this.menuView.username = this.pocketApi.username;
   }

   showPopup(selector: string) {
      const controller = new SettingsController(
         this.pocketApi,
         this.filterModel,
         this.selectedBookmarks
      );

      const $modal = $("#settings-modal");
      const $container = $modal.find(".modal-body");
      $container.children().appendTo("#setting-modals");
      $container.append($(selector));
      $modal.modal({});
   }
}
