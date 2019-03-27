import "../index.html";
import "../img/loader.gif";
//import "../favicon.ico";
import "../css/tagify.css";
//import "../css/open-iconic-bootstrap.min.css";
// import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/js/dist/util";
import "bootstrap/js/dist/index";
import "bootstrap/js/dist/popover";
import "bootstrap/js/dist/modal";
import "bootstrap/js/dist/collapse";
import "bootstrap/js/dist/toast";
import "bootstrap/js/dist/dropdown";
import "bootstrap/js/dist/tab";
import "./utils";
import "babel-polyfill";
import "../css/main.css";

import { ApiFactory, ApiDataSource, BookmarkApi } from "./models/pocket-api";
import FilterModel from "./models/filter-model";
import { MainController } from "./controllers/main-controller";
import { toast } from "./utils";

$(async function() {
   let api = await createInitialApi({});
   const filterModel = new FilterModel(api, {});
   new MainController(api, filterModel);
});

async function createApi(options: any) {
   let datasource = await ApiFactory.createDataSource(options);
   return await ApiFactory.createApi(datasource);
}

async function createInitialApi(options: any) {
   try {
      return await createApi(options);
   } catch (err) {
      console.error(err);
      toast("Using samples instead", {
         title: "Error finding your bookmarks.",
         type: "danger"
      });
      return await createSafeApi();
   }
}

async function createSafeApi() {
   try {
      return await createApi({ mode: "sample" });
   } catch (err) {
      console.error(err);
      toast("Things are really broken.", {
         title: "Error loading samples",
         type: "danger"
      });

      throw new Error(err);
   }
}
