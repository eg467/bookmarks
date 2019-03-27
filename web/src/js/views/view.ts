import { eif } from "../utils";

export interface IViewSettings {
   initiallyVisible?: boolean;
   className?: string;
   attr?: { [key: string]: string };
   $root?: JQuery<HTMLElement>;
}

export class TypedEvent<TSender, TArgs> {
   private callbacks: ((sender: TSender, args: TArgs) => void)[] = [];
   constructor(public sender: TSender) {}
   private lastResult: { args: TArgs } = null;

   subscribe(handler: (sender: TSender, args: TArgs) => void, memory = true) {
      eif(memory && this.lastResult, r => handler(this.sender, r.args));
      this.callbacks.push(handler);
   }

   unsubscribe(handler: (sender: TSender, args: TArgs) => void) {
      const io = this.callbacks.indexOf(handler);
      if (io >= 0) {
         this.callbacks.splice(io, 1);
      }
   }

   trigger(args: TArgs) {
      this.lastResult = { args };
      this.callbacks.forEach(c => c(this.sender, args));
   }
}

export class View {
   $root: JQuery<HTMLElement>;

   // Defaults
   settings: IViewSettings = {
      initiallyVisible: true
   };

   constructor(settings: IViewSettings) {
      this.settings = $.extend(this.settings, settings);
      this.$root = this.settings.$root || this.$createRoot();

      $.each(this.settings.attr || {}, (k, v) => {
         this.$root.attr(k + "", v);
      });

      eif(this.settings.className, c => this.$root.addClass(c));
      eif(!this.settings.initiallyVisible, _ => this.hide());
   }

   show() {
      this.$root.show();
   }

   hide() {
      this.$root.hide();
   }

   destroy() {
      this.$root.remove();
      this.$root = null;
   }

   protected $createRoot() {
      return $("<div>");
   }

   appendTo($container: JQuery<HTMLElement>) {
      this.$root.appendTo($container);
   }
}
