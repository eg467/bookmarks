import { View } from "./view";
import SelectedItems from "../models/selected-items";
import { MainController } from "../controllers/main-controller";
import TagEditorView from "./tag-editor-view";
import BulkEditController from "../controllers/bulk-edit-controller";

// TODO: Lazy load view on expansion
export default class BulkEditView extends View {
   public tagEditor: TagEditorView;

   constructor(
      private readonly controller: BulkEditController,
      private readonly selectedBookmarks: SelectedItems
   ) {
      super({});
      this.populateRoot();
   }

   protected $createRoot() {
      return $("#bulk-edit-container");
   }

   private populateRoot() {
      $("#bulk-only-selected").on("change", function(e) {
         $(document.body).toggleClass("only-selected", $(this).is(":checked"));
      });

      this.tagEditor = new TagEditorView({
         $root: $("#bulk-tag-editor"),
         list: false
      });

      $("#bulk-select-all").btnclick(() => this.controller.selectAll());
      $("#bulk-select-filtered").btnclick(() =>
         this.controller.selectFiltered()
      );
      $("#bulk-deselect-all").btnclick(() => this.controller.deselectAll());
      $("#bulk-favorite").btnclick(() => this.controller.favorite(true));
      $("#bulk-unfavorite").btnclick(() => this.controller.favorite(false));
      $("#bulk-archive").btnclick(() => this.controller.archive(true));
      $("#bulk-unarchive").btnclick(() => this.controller.archive(false));
      $("#bulk-delete").btnclick(() => this.controller.delete());
      $("#btn-bulk-tags").btnclick(() =>
         this.controller.editTags(this.tagEditor.value)
      );
   }

   private wireHandlers() {
      $("#bulk");
   }
}
