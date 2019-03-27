import { View, IViewSettings, TypedEvent } from "./view";
import "../utils";
import { ILinkData, PocketDataSource } from "../models/pocket-api";
import TagEditorView from "./tag-editor-view";
import ResultsController from "../controllers/results-controller";

export interface IListingViewSettings extends IViewSettings {
   showBackgroundImages?: boolean;
}

export interface ILinkChangedEventArgs {
   link: ILinkData;
   action: "favorite" | "archive" | "select";
   data: any;
}

export default class ListingView extends View {
   public linkChangedEvent = new TypedEvent<ListingView, ILinkChangedEventArgs>(
      this
   );

   /**
    * @param link
    * @param tagEditor The premade tag editor view that will be attached to this listing upon user action
    * @param settings
    */
   constructor(
      public link: ILinkData,
      private tagEditor: TagEditorView,
      private controller: ResultsController,
      public settings: IListingViewSettings
   ) {
      super(
         $.extend(
            {
               showBackgroundImages: true
            },
            settings
         )
      );
      this.update(link);
   }

   protected $createRoot() {
      return $(
         `<div class="item-listing">
            <img class="site-img" alt="site-image" src="https://i.imgur.com/gn0z42M.png">
            <div class="item-details">
               <div class="title">
                  <img src="" class="favicon" alt="logo" />
                  <span class="site badge badge-dark"></span>
                  <a href="#" class="strong-bg">title</a>
               </div>
               <div class="content">
                  <span class="excerpt strong-bg"></span>
                  <span class="authors"></span>
               </div>
               <div class="item-footer">
                  <span class="badge tag-like badge-danger show-on-readonly">readonly</span>
                  <span class="item-controls hide-on-readonly">

                     <a class="icon-btn favorite" href="#">
                        <svg viewBox="0 0 8 8">
                           <use xlink:href="assets/icons.svg#heart"></use>
                        </svg>
                     </a>

                     <a class="icon-btn archive" href="#">
                        <svg viewBox="0 0 8 8">
                           <use xlink:href="assets/icons.svg#box"></use>
                        </svg>                     
                     </a>

                     <a class="icon-btn delete" href="#">
                        <svg viewBox="0 0 8 8">
                           <use xlink:href="assets/icons.svg#trash"></use>
                        </svg>                     
                     </a>

                  </span>
                  <div class="tag-container">
                     <a class="icon-btn tag-edit-start hide-on-readonly" href="#">
                        <svg viewBox="0 0 8 8">
                           <use xlink:href="assets/icons.svg#tags"></use>
                        </svg>
                     </a>
                  </div>

                  <div class="tag-edit-container">
                     <div class="d-inline-block"></div>
                     <button type="button" class="btn btn-primary btn-sm tag-edit-complete">Finished</button>
                  </div>
               </div>
            </div>
         </div>`
      );
   }

   /**
    *
    * @param {*} link The link new data or null to refresh on the current object.
    */
   update(link: ILinkData = null) {
      // If no listing was provided, refresh the current one
      link = link || this.link;
      this.link = link;

      // Listing
      this.$root.attr("id", `item_${link.item_id}`).data("item", link);

      // Icon
      let iconUrl = this.favicon(link.resolved_url);
      iconUrl = this.cachedImageUrl(iconUrl);
      this.$root.find(".favicon").attr("src", iconUrl);

      // Domain label
      this.$root
         .find(".site")
         .text(this.domain(link.resolved_url).replace("www.", ""));

      // Title
      this.$root
         .find(".title a")
         .text(link.given_title)
         .attr("title", link.resolved_url)
         .attr("href", link.resolved_url);

      // Excerpt
      this.$root.find(".excerpt").text(link.excerpt || "");

      // Archived
      this.$root
         .find(".archive")
         .applyClass("selected", link.status == "1")
         .off("click")
         .btnclick(this.toggleArchive.bind(this));

      // Favorite click event
      this.$root
         .find(".favorite")
         .applyClass("selected", link.favorite == "1")
         .off("click")
         .btnclick(this.toggleFavorite.bind(this));

      // Delete
      this.$root
         .find(".delete")
         .off("click")
         .btnclick(this.delete.bind(this));

      // Authors
      this.$root
         .find(".authors")
         .empty()
         .append(
            (link.authors || []).map(a =>
               $("<span>")
                  .addClass("font-italic")
                  .text(a)
            )
         );

      // Selection Checkmark
      // this.$root
      //    .find(".selection")
      //    .off("click")
      //    .click(toggleHandler(this.toggleSelected.bind(this)));

      // Tags
      this.displayTags(link.tags);

      // Tag Control Toggles
      this.$root
         .find(".tag-edit-start")
         .off("click")
         .btnclick(() => this.attachTagEditor());
      this.$root
         .find(".tag-edit-complete")
         .off("click")
         .btnclick(async () => await this.detachTagEditor());

      // Background
      // const urls: string[] = [
      //    link.top_image_url,
      //    link.image,
      //    this.favicon(link.resolved_url)
      // ].filter(v => !!v);
      // //const siteImgUrls=  []

      const $siteImg = this.$root.find(".site-img");
      const siteImgUrl =
         link.top_image_url || link.image || this.favicon(link.resolved_url);

      if (siteImgUrl) {
         const siteImg = this.cachedImageUrl(siteImgUrl, {
            w: "64",
            errorredirect: "https://i.imgur.com/gn0z42M.png"
         });
         $siteImg.attr("src", siteImg);
      }
   }

   private async toggleArchive($sender: JQuery<HTMLElement>) {
      const status = !$sender.hasClass("selected");
      await this.controller.archive(this.link, status);
   }

   private async toggleFavorite($sender: JQuery<HTMLElement>) {
      const status = !$sender.hasClass("selected");
      await this.controller.favorite(this.link, status);
   }

   private deleteTimeout: number = null;
   private async delete() {
      if (!this.deleteTimeout) {
         this.displayDeleteConfirmation();
      } else {
         clearTimeout(this.deleteTimeout);
         await this.controller.delete(this.link);
      }
   }

   private displayDeleteConfirmation() {
      const $btn = this.$root.find(".delete");
      $btn.text("Click again to confirm deletion.");
      this.deleteTimeout = setTimeout(() => {
         this.deleteTimeout = null;
         $btn.text("");
      }, 4000);
   }

   private attachTagEditor() {
      const tEditor = this.tagEditor;
      tEditor.link = this.link;
      tEditor.valueNoEvents = [...this.link.tags];
      tEditor.appendTo(
         this.$root
            .find(".tag-edit-container")
            .children()
            .first()
      );
      tEditor.show();
      this.$root.addClass("edit-tags");
   }

   private async detachTagEditor() {
      const tEditor = this.tagEditor;
      const tags = this.tagEditor.value;

      // Update locally for now
      this.link.tags = [...tags];
      this.displayTags(tags);

      tEditor.link = null;
      tEditor.valueNoEvents = [];
      tEditor.hide();
      this.$root.removeClass("edit-tags");
   }

   private favicon(url: string) {
      // Google blocks "trackers" sometimes :(
      // return `https://s2.googleusercontent.com/s2/favicons?domain_url=${url}`;

      return `//${this.domain(url)}/favicon.ico`;
   }

   private domain(url: string) {
      return url
         .replace("ftp://", "")
         .replace("http://", "")
         .replace("https://", "")
         .split(/[\/?#]/)[0];
   }

   // private cachedImageWithFallbacksUrl(
   //    urls: string[] = [],
   //    options: { [key: string]: string } = {}
   // ) {
   //    return urls.reduceRight((acc, val, i) => {
   //       return this.cachedImageUrl(val, options, acc || undefined, i === 0);
   //    }, "");
   // }

   private cachedImageUrl(
      url: string,
      options: { [key: string]: string } = {},
      encodeQs = false
   ) {
      options.url = url.replace(/^https?:/, "");

      options = $.extend(
         { errorredirect: "https://i.imgur.com/9SzLuvf.png" },
         options
      );

      const proxyEmpty = false;
      if (!url) {
         if (proxyEmpty) {
            options.url = options.errorredirect;
         } else {
            // Warning: ignores options
            return options.errorredirect;
         }
      }

      // Encoding disabled
      const encode = encodeQs && false ? encodeURIComponent : (s: string) => s;
      const qs = $.map(options, (v, k) => `${k}=${encode(v)}`);
      return `https://images.weserv.nl/?${qs.join("&")}`;
   }

   private displayTags(tags: string[]) {
      this.$root.find(".tag").remove();
      this.$root.find(".tag-edit-start").before(
         tags.map(t =>
            $("<span>")
               .addClass("tag badge badge-pill badge-secondary")
               .text(t)
         )
      );
   }
}
