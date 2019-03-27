import { View, IViewSettings, TypedEvent } from "./view";
import TagEditorView, {
   ITagChangedEventArgs,
   ITagEditorViewSettings
} from "./tag-editor-view";
import { MenuController } from "../controllers/menu-controller";

export class FilterTagView extends TagEditorView {
   constructor(
      private controller: MenuController,
      public key: "and" | "or" | "not",
      settings: ITagEditorViewSettings
   ) {
      super($.extend({ showList: true }, settings));
   }

   protected onTagChanged(args: ITagChangedEventArgs) {
      super.onTagChanged(args);
      this.controller.filterQueryChanged(this);
   }
}

export interface IFilterViewSettings extends IViewSettings {
   placeholder?: string;
}

export class FilterTextView extends View {
   private $text: JQuery<HTMLElement>;

   private lastValue: string;

   constructor(
      private controller: MenuController,
      public key: "content",
      settings: IFilterViewSettings
   ) {
      super(settings);
      this.$text = this.$root
         .findSelf('input[type="text"]')
         .attr("placeholder", settings.placeholder);
      this.$root.on("propertychange change click keyup input paste", () => {
         this.onPossiblyChanged();
      });
   }

   protected $createRoot() {
      return $('<input type="text">');
   }

   private onPossiblyChanged() {
      if (this.lastValue !== this.value) {
         this.controller.filterQueryChanged(this);
         this.lastValue = this.value;
      }
   }

   get value() {
      return <string>this.$text.val();
   }
   set value(value: string) {
      this.$text.val(value);
      this.onPossiblyChanged();
   }
}
