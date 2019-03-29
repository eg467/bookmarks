import { View, IViewSettings, TypedEvent } from "./view";
import "../tagify";
import { ILinkData } from "../models/pocket-api";
import { eif } from "../utils";

export interface ITagEditorViewSettings extends IViewSettings {
   whitelist?: string[];
   blacklist?: string[];
   placeholder?: string;
   list?: "popover" | "list" | false;
}

export interface ITagChangedEventArgs {
   oldTag?: string;
   newTag?: string;
   action: string;
}

export default class TagEditorView extends View {
   public suppressEvents = false;
   public link: ILinkData = null;
   public tagify: any;
   private $input: JQuery<HTMLElement>;
   public changeEvent = new TypedEvent<TagEditorView, ITagChangedEventArgs>(
      this
   );
   private tagChangedCallback: any;

   constructor(public settings: ITagEditorViewSettings = {}) {
      super($.extend({ list: "popover" }, settings));
      this.tagifyRoot();
      this.setupHandlers();
      this.wireHandlers();
   }

   protected $createRoot() {
      const $root = $("<div>");
      $root.append($("<input>"));

      return $root;
   }

   private tagifyRoot() {
      this.$input = this.$root.findSelf("input");
      this.destroy();

      this.tagify = this.$input
         .tagify({
            whitelist: this.settings.whitelist || [],
            blacklist: this.settings.blacklist || []
         })
         .data("tagify");

      // Create a button that displays a popup that lists all available tags.
      if (this.settings.list === "popover") {
         this.addPopover();
      } else if (this.settings.list === "list") {
         this.addList();
      }
   }

   private addPopover() {
      const refreshPopover = () => {
         const $popoverContent = this.$root.find(".popover-body");
         $popoverContent.children().remove();
         $popoverContent.addClass("available-tags");
         this.addTagsToContainer($popoverContent);
      };

      $(`
      <a tabindex="0"
         class="btn btn-sm btn-secondary btn-available-tags"
         role="button"
         data-toggle="popover"
         data-placement="bottom"
         data-trigger="focus"
         title="Available Tags"
         data-content=""
         >List</a>`)
         .popover({
            container: this.$root[0]
         })
         .on("shown.bs.popover", _ => refreshPopover())
         .prependTo(this.$root);
   }

   private addList() {
      if (this.settings.list) {
         this.$root.append($("<div>").addClass("collapse available-tags-list"));
      }

      $(`<a href="#" class="btn btn-primary" data-toggle="collapse" role="button" aria-expanded="false">
            Show Tags
         </a>`)
         .btnclick(s => {
            this.$root.find(".available-tags-list").collapse("toggle");
         })
         .prependTo(this.$root);
   }

   private refreshTagList() {
      eif(this.$root.find(".available-tags-list"), $container =>
         this.addTagsToContainer($container)
      );
   }

   destroy() {
      if (!this.tagify) {
         return;
      }
      this.whitelist = [];
      this.blacklist = [];
      this.tagify.destroy();
      this.tagify = null;
      super.destroy();
   }

   private setupHandlers() {
      this.tagChangedCallback = this.tagChanged.bind(this);
   }

   private wireHandlers() {
      this.$input.on("add remove edit", this.tagChangedCallback);
   }

   private tagChanged(
      e: JQuery.TriggeredEvent<
         HTMLElement,
         undefined,
         HTMLElement,
         HTMLElement
      >,
      args: any
   ) {
      const action = e.type;
      var oldTag, newTag;

      if (action === "add") {
         newTag = args.data.value;
      } else if (action === "remove") {
         oldTag = args.data.value;
      } else if (action === "edit") {
         oldTag = args.data.value;
         newTag = $(args.tag).attr("value");
      }
      this.onTagChanged({ action, oldTag, newTag });
   }

   private addTagsToContainer($container: JQuery<HTMLElement>) {
      $container.children().remove();
      this.whitelist.forEach(tag => {
         $container.append(
            $("<a>")
               .addClass("badge badge-pill lg badge-success")
               .attr("href", "#")
               .text(tag)
               .btnclick($s => this.addTags([$s.text()]), true, true)
         );
      });
   }

   protected onTagChanged(args: ITagChangedEventArgs) {
      if (!this.suppressEvents) {
         this.changeEvent.trigger(args);
      }
   }

   get whitelist(): string[] {
      return this.tagify.settings.whitelist;
   }
   set whitelist(value: string[]) {
      this.tagify.settings.whitelist = value || [];
      this.refreshTagList();
   }

   get blacklist() {
      return this.tagify.settings.blacklist;
   }
   set blacklist(value) {
      this.tagify.settings.blacklist = value || [];
   }

   get value() {
      return <string[]>this.tagify.value.map((tag: any) => tag.value);
   }
   set value(tags) {
      const tmp = this.suppressEvents;
      this.valueNoEvents = tags;
      this.suppressEvents = tmp;
      this.onTagChanged({ action: "replace", newTag: tags.join() });
   }

   set valueNoEvents(tags: string[]) {
      this.suppressEvents = true;
      this.removeAllTags();
      this.addTags(tags);
      this.suppressEvents = false;
   }

   addTags(tags: string[]) {
      this.tagify.addTags(tags);
   }
   removeTags(tags: string[]) {
      tags = $.isArray(tags) ? tags : [tags];
      tags.forEach(tag => this.tagify.removeTag(tag));
   }
   removeAllTags() {
      this.tagify.removeAllTags();
   }
}
