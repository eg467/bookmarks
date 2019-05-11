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

import { ApiFactory, BookmarkApi } from "./models/pocket-api";
import FilterModel from "./models/filter-model";
import { MainController } from "./controllers/main-controller";
import { toast } from "./utils";

$(async function () {
   //let api = await createInitialApi({});

   const api = await Promise.resolve()
      .then(function () {
         return createApi({});
      })
      .catch(function (err) {
         console.error("Error loading requested API.", err);
         toast("Using samples instead.", {
            title: "Error loading from API",
            type: "danger"
         });
         return createApi({ mode: "sample" });
      })
      .catch(function (err) {
         console.error("Error loading Sample API.", err);
         toast("Things are really broken.", {
            title: "Error loading samples",
            type: "danger"
         });
         throw err;
      });

   const filterModel = new FilterModel(api, {});
   new MainController(api, filterModel);
});

async function createApi(options: any) {
   let datasource = await ApiFactory.createDataSource(options);
   await datasource.authorize();
   const api = await ApiFactory.createApi(datasource);

   // Ensure we can receive results
   await api.retrieve({});

   return api;
}
