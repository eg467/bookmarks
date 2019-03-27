import { SetOps, eif } from "../utils";
import { View } from "./view";
import ListingView, { IListingViewSettings } from "./listing-view";
import TagEditorView, { ITagChangedEventArgs } from "./tag-editor-view";
import { ILinkData } from "../models/pocket-api";
import { Bookmarks } from "../models/Bookmarks";
import FilterModel from "../models/filter-model";
import ResultsController from "../controllers/results-controller";

export interface ILinkTagChangedEventArgs extends ITagChangedEventArgs {
   link: ILinkData;
}

export default class ListingsCollectionView extends View {
   // The individual link listings
   public listingViews: { [item_id: string]: ListingView } = {};
   public tagEditor: TagEditorView = new TagEditorView();
   // Used for tracking changes
   public fullResults: Bookmarks;

   private resultsChangedCallback: (sender: FilterModel) => void;
   private tagChangedCallback: (
      sender: TagEditorView,
      args: ITagChangedEventArgs
   ) => Promise<void>;
   //public linkChangedEvent = new TypedEvent<ListingView, ILinkChangedEventArgs>(this)
   //public tagChangedEvent = new TypedEvent<ListingsCollectionView, ILinkTagChangedEventArgs>(this);

   constructor(
      private controller: ResultsController,
      private filterModel: FilterModel,
      public settings: IListingViewSettings = {}
   ) {
      super(
         $.extend(settings, {
            showBackgroundImages: true
         })
      );

      this.setupHandlers();
      this.wireHandlers();
   }

   private setupHandlers() {
      this.resultsChangedCallback = this.onFilterChanged.bind(this);
      this.tagChangedCallback = this.onTagsChanged.bind(this);
   }

   private wireHandlers() {
      this.filterModel.resultsChangedEvent.subscribe(
         this.resultsChangedCallback
      );
      this.tagEditor.changeEvent.subscribe(this.tagChangedCallback);
   }

   private onFilterChanged(_: FilterModel) {
      this.refresh();
   }

   private async onTagsChanged(
      sender: TagEditorView,
      args: ITagChangedEventArgs
   ) {
      // NOTE: remember to set the link property when this is attached to a listing
      await this.controller.setTags(sender.link, sender.value);
   }

   /**
    * Displays all filtered results and updates the unfiltered results if they've changed.
    * @param {string} id The itemId of the specific link to refresh, or null to refresh all filtered results
    */
   refresh(id: string = null) {
      if (id) {
         this.listingViews[id].update();
         return;
      }

      if (this.fullResults !== this.filterModel.fullResults) {
         this.fullResults = this.filterModel.fullResults;
         this.updateAllViews();
      }

      const visibleIds = Object.keys(this.filterModel.filteredResults.items);
      this.showFilteredViewIds(new Set(visibleIds));
      this.tagEditor.whitelist = this.filterModel.filteredResults.tagList;
   }

   /**
    * Displays only the specified items.
    * @param {Set<string>} ids A set of item ids that should be visible
    */
   showFilteredViewIds(ids: Set<string>) {
      $.each(this.listingViews, (itemId, view) => {
         ids.has(itemId + "") ? view.show() : view.hide();
      });
   }

   /**
    *
    * @param {Bookmarks} fullResults
    */
   updateAllViews() {
      const fullResults = this.filterModel.fullResults;
      const links = fullResults.links;
      // Add or update new items
      for (const link of links) {
         this.cachedOrCreatedListingView(link);
      }

      // Delete removed items
      var newIds = new Set(links.map(link => link.item_id));
      var cachedListingIds = new Set(Object.keys(this.listingViews));
      const removedIds = SetOps.difference(cachedListingIds, newIds);
      removedIds.forEach(this.deleteView.bind(this));
   }

   removeView(itemId: string) {
      eif(this.listingViews[itemId], view => {
         view.$root.fadeOut({
            complete: () => this.deleteView(itemId)
         });
      });
   }

   private deleteView(itemId: string) {
      this.listingViews[itemId].destroy();
      delete this.listingViews[itemId];
   }

   cachedOrCreatedListingView(link: ILinkData) {
      let listing = this.listingViews[link.item_id];

      if (!listing) {
         // The view hasn't been created yet.
         listing = new ListingView(link, this.tagEditor, this.controller, {
            showBackgroundImages: this.settings.showBackgroundImages
         });

         this.listingViews[link.item_id] = listing;
         this.$root.append(listing.$root);
      } else {
         // The view already exists, but might be stale.
         listing.update(link);
      }

      return listing;
   }

   get autoComplete() {
      return this.tagEditor.whitelist;
   }

   set autoComplete(value) {
      this.tagEditor.whitelist = value || [];
   }
}