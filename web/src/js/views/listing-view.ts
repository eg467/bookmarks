import { View, IViewSettings, TypedEvent } from "./view";
import "../utils";
import { ILinkData } from "../models/pocket-api";
import TagEditorView from "./tag-editor-view";
import ResultsController from "../controllers/results-controller";

require("../../img/icons.svg");
const alttoIcon = require("../../img/alternativeto.png");
const similarSitesIcon = require("../../img/similarsites.png");

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

            <div class="domain"></div>
            
            <div class="title">
               <img class="favicon" src="" alt="favicon">
               <a href="#"></a>
            </div>

            <div class="alt-links">
               <span class="show-on-item-hover">
                  <a href="#" class="title-btn altto-link" title="AlternativeTo"><img src="${alttoIcon}" alt="AlternativeTo"></a>
                  <a href="#" class="title-btn ss-link" title="Similar Sites"><img src="${similarSitesIcon}" alt="Similar Sites"></a>
               </span>
            </div>

            <div class="summary"></div>

            <div class="item-controls hide-on-readonly show-on-item-hover text-right">
               <span class="text-danger tag-like show-on-readonly">readonly</span>
               <div class="hide-on-readonly">
                  <a class="icon-btn red-icon-btn favorite" href="#">
                     <svg viewBox="0 0 8 8">
                        <use xlink:href="assets/icons.svg#heart"></use>
                     </svg>
                  </a>

                  <a class="icon-btn gray-icon-btn archive" href="#">
                     <svg viewBox="0 0 8 8">
                        <use xlink:href="assets/icons.svg#box"></use>
                     </svg>
                  </a>

                  <a class="icon-btn danger-icon-btn delete" href="#">
                     <svg viewBox="0 0 8 8">
                        <use xlink:href="assets/icons.svg#trash"></use>
                     </svg>
                     <span class="confirm-delete">Click To Confirm</span>
                  </a>
               </div>
            </div>

            <div class="tag-container">
               <div class="current-tags">
                  <a class="icon-btn tag-edit-start gray-icon-btn hide-on-readonly show-on-item-hover" href="#">
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

      const domain = this.domain(link.resolved_url).replace(/^www\./i, "");
      const isBlock = this.$root.closest(".block").exists();

      // Listing
      this.$root.attr("id", `item_${link.item_id}`).data("item", link);

      // Favicon
      let iconUrl = this.favicon(link.resolved_url);
      iconUrl = this.cachedImageUrl(iconUrl);
      this.$root
         .find(".favicon")
         .off("load")
         .one("load", function() {
            $(this).toggle((<HTMLImageElement>this).naturalWidth > 1);
         })
         .attr("src", iconUrl);

      // Domain label
      this.$root.find(".domain").text(domain);

      // Title
      this.$root
         .find(".title a")
         .text(link.given_title)
         .attr("title", link.resolved_url)
         .attr("href", link.resolved_url);

      // AlternativeTo Link
      this.$root
         .find(".altto-link")
         .attr(
            "href",
            `https://alternativeto.net/browse/search?q=${encodeURIComponent(
               domain
            )}`
         );

      this.$root
         .find(".ss-link")
         .attr(
            "href",
            `https://www.similarsites.com/site/${encodeURIComponent(domain)}`
         );

      // Summary

      const summary = link.excerpt || "";
      const authors = (link.authors || []).join(", ");
      this.$root
         .find(".summary")
         .dblclick(function(e) {
            e.preventDefault();
         })
         .one("click", function(e) {
            $(this).addClass("full");
         })
         .text(`${summary}${authors ? " -" : ""}${authors}`);

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

      // Tags
      this.displayTags(link.tags);

      // Start/stop tag editing buttons
      this.$root
         .find(".tag-edit-start")
         .off("click")
         .btnclick(() => this.attachTagEditor());
      this.$root
         .find(".tag-edit-complete")
         .off("click")
         .btnclick(async () => await this.detachTagEditor());

      // Site side image
      if (isBlock) {
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
         //$siteImg.btnclick(() => this.toggleSelection());
      }
      // Selection status
      this.$root.dblclick(e => this.toggleSelection(e));
      this.refreshSelection();
   }

   private async toggleSelection(
      e: JQuery.DoubleClickEvent<HTMLElement, null, HTMLElement, HTMLElement>
   ) {
      const selected = !this.$root.hasClass("selected");
      await this.controller.selectBookmark(this.link.item_id, selected);
      e.preventDefault();
      e.stopPropagation();
      return false;
   }

   refreshSelection() {
      const isSelected = this.controller.selectedBookmarks.contains(
         this.link.item_id
      );
      this.$root.applyClass("selected", isSelected);
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
      this.$root.find(".confirm-delete").fadeIn();
      this.deleteTimeout = window.setTimeout(() => {
         this.deleteTimeout = null;
         this.$root.find(".confirm-delete").fadeOut();
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
      $(".edit-tags").removeClass("edit-tags");
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
      this.$root.find(".current-tags .tag").remove();
      this.$root.find(".tag-edit-start").before(
         tags.map(t =>
            $("<span>")
               .addClass("tag badge badge-pill badge-secondary")
               .text(t)
         )
      );
   }
}
