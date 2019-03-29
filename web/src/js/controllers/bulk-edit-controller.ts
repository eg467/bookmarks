import BulkEditView from "../views/bulk-edit-view";
import SelectedItems from "../models/selected-items";
import FilterModel from "../models/filter-model";
import { BookmarkApi, PocketLinkEditor, ILinkData } from "../models/pocket-api";
import { SetOps, toast } from "../utils";

export default class BulkEditController {
   private readonly view: BulkEditView;

   constructor(
      private readonly api: BookmarkApi,
      private readonly filterModel: FilterModel,
      private readonly selections: SelectedItems
   ) {
      this.view = new BulkEditView(this, this.selections);
   }

   selectAll() {
      const keys = Object.keys(this.filterModel.fullResults.items);
      this.selections.reset(keys);
   }

   selectFiltered() {
      const keys = Object.keys(this.filterModel.filteredResults.items);
      this.selections.reset(keys);
   }

   deselectAll() {
      this.selections.reset([]);
   }

   async editTags(tags: string[]) {
      const added = tags.filter(t => !t.startsWith("-"));
      const removed = tags
         .filter(t => t.startsWith("-") && t !== "-*")
         .map(t => t.substr(1));
      let removeAll = removed.some(t => t === "-*");

      let action: (editor: PocketLinkEditor, link: ILinkData) => void = (
         editor,
         link
      ) => {
         if (removeAll) {
            editor.setTags(link, added);
            return;
         }
         if (removed.length) {
            editor.removeTags(link, removed);
         }
         if (added.length) {
            editor.addTags(link, added);
         }
      };

      await this.bulkAction(action);
      toast("Bookmark(s) tags updated.", { type: "success" });
      this.view.tagEditor.value = [];
   }

   async favorite(status: boolean) {
      await this.bulkAction((editor, link) => editor.setFavorite(link, status));
      toast("Bookmark(s) " + (status ? "favorited" : "unfavorited"), {
         type: "success"
      });
   }

   async archive(status: boolean) {
      await this.bulkAction((editor, link) => editor.setArchive(link, status));
      toast("Bookmark(s) " + (status ? "archived" : "unarchived"), {
         type: "success"
      });
   }

   async delete() {
      await this.bulkAction((editor, link) => editor.delete(link.item_id));
      toast("Bookmark(s) deleted.");
   }

   private selectedBookmarkData() {
      return [
         ...SetOps.map(
            this.selections.selectedIds,
            id => this.filterModel.fullResults.items[id]
         )
      ];
   }

   private async bulkAction(
      action: (editor: PocketLinkEditor, link: ILinkData) => void
   ) {
      try {
         const editor = this.api.createEditor();
         this.selectedBookmarkData().forEach(link => action(editor, link));
         await editor.saveChanges();
      } catch (err) {
         console.error(err);
         toast("There was an error modifying your bookmarks", {
            type: "danger"
         });
         throw err;
      }
   }
}
