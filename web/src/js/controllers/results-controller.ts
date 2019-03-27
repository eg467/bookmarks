import ListingsCollectionView from "../views/listings-collection-view";
import { PocketDataSource, ILinkData, BookmarkApi } from "../models/pocket-api";
import FilterModel from "../models/filter-model";
import { toast } from "../utils";

export default class ResultsController {
   listingsCollectionView: ListingsCollectionView;

   constructor(
      public api: BookmarkApi,
      public filterModel: FilterModel,
      public settings: any
   ) {
      this.listingsCollectionView = new ListingsCollectionView(
         this,
         filterModel
      );
      this.listingsCollectionView.appendTo($("#view-container"));
   }

   async archive(link: ILinkData, status: boolean) {
      await this.api
         .createEditor()
         .setArchive(link, status)
         .saveChanges();
      this.listingsCollectionView.refresh(link.item_id);
      toast(`Bookmark ${status ? "archived" : "unarchived"}`, {
         type: "success"
      });
   }

   async favorite(link: ILinkData, status: boolean) {
      await this.api
         .createEditor()
         .setFavorite(link, status)
         .saveChanges();
      this.listingsCollectionView.refresh(link.item_id);
      toast(`Bookmark ${status ? "favorited" : "unfavorited"}`, {
         type: "success"
      });
   }

   async delete(link: ILinkData) {
      const itemId = link.item_id;
      await this.api
         .createEditor()
         .delete(itemId)
         .saveChanges();
      this.listingsCollectionView.removeView(itemId);
      toast("Bookmark deleted", { type: "success" });
   }

   async setTags(link: ILinkData, tags: string[]) {
      await this.api
         .createEditor()
         .setTags(link, tags)
         .saveChanges();
      this.listingsCollectionView.refresh(link.item_id);
      toast("Tags updated", { type: "success" });
   }
}
