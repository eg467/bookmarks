import { View, IViewSettings } from "./view";
import { SettingsController } from "../controllers/settings-controller";

export class SettingsView extends View {
   constructor(
      private controller: SettingsController,
      settings: IViewSettings
   ) {
      super(settings);

      this.populateRoot();
      this.wireHandlers();
   }

   populateRoot() {
      this.updateSyncerDisplay();
   }

   updateSyncerDisplay() {
      const syncer = this.controller.syncer;
      const enabled = syncer.enabled;

      $("#cb-sync").prop("checked", enabled);
      $("#lbl-bookmark-sync").text(
         enabled
            ? "Your bookmarks are being saved to: "
            : "Your bookmarks have been saved to: "
      );

      $("#sync-display").applyClass("hide", !syncer.key);
      $("#sync-display").applyClass("alert-success", enabled);
      $("#sync-display").applyClass("alert-danger", !enabled);
      this.myjsonLink("#myjson-sync-link", syncer.key);
      this.myjsonDsLink("#myjson-permalink", syncer.key);
   }

   private myjsonLink(sel: string, key: string) {
      const url = `https://api.myjson.com/bins/${key}`;
      return $(sel)
         .toggle(!!key)
         .text(url)
         .attr("href", url);
   }

   private myjsonDsLink(sel: string, key: string) {
      const url = `${window.location.origin}${
         window.location.pathname
      }?mode=myjson&key=${key}`;
      return $(sel)
         .toggle(!!key)
         .text(url)
         .attr("href", url);
   }

   private wireHandlers() {
      $("#cb-sync").change(e => {
         //this.setSynced( (<HTMLInputElement>e.target).checked);
         this.setSynced(e);
      });

      $("#btn-firefox-import-readonly").btnclick(async _ => {
         await this.importFromFirefox(true);
      });

      $("#btn-firefox-import").btnclick(async _ => {
         await this.importFromFirefox(false);
      });

      $("#btn-firefox-export").btnclick(async _ => {
         await this.exportToFirefox();
      });

      $("#btn-myjson-import-readonly").btnclick(async _ => {
         await this.importFromMyJson(true);
      });

      $("#btn-myjson-import").btnclick(async _ => {
         await this.importFromMyJson(false);
      });

      $("#btn-myjson-export").btnclick(async _ => {
         await this.exportToMyJson();
      });
   }

   private setSynced(
      e: JQuery.ChangeEvent<HTMLElement, null, HTMLElement, HTMLElement>
   ) {
      const enabled = $(e.target).is(":checked");
      this.controller.synced = enabled;
   }

   private async exportToFirefox() {
      this.controller.exportToFirefox({
         useOriginalTime: $("#firefox-use-orig-dates").is(":checked"),
         treatTagsAsFolders: $("#firefox-dirs-as-tags").is(":checked")
      });
   }

   private async importFromFirefox(toReadOnly: boolean = true) {
      const json = $("#firefox-import-json").val() + "";
      await this.controller.importFromFirefox(json, toReadOnly, {
         useOriginalTime: $("#firefox-use-orig-dates").is(":checked"),
         treatTagsAsFolders: $("#firefox-dirs-as-tags").is(":checked")
      });
   }

   private async exportToMyJson() {
      await this.controller.exportToMyJson();
   }

   exportedToMyJson(key: string) {
      $("#myjson-manual-export").show();
      this.myjsonLink("#myjson-manual-export-link", key);
      this.myjsonDsLink("#myjson-manual-permalink", key);
   }

   private async importFromMyJson(toReadOnly: boolean) {
      let key = $("#myjson-key").val() + "";
      key = key.indexOf("://") > -1 ? key.split("/").pop() : key;
      await this.controller.importFromMyJson(key, toReadOnly);
   }
}
