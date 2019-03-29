import { SetOps, querystring, eif, toast } from "../utils";
import { MyJsonConverter, JsonConverter } from "./bookmark-converter";
import { TypedEvent } from "../views/view";
import { Bookmarks } from "./Bookmarks";

export interface PocketApiSettings {
   redirectUrl: string;
   accessToken?: string; // For debugging.
   forceLogin?: boolean;
}

export class ApiFactory {
   static pocketDs(accessToken: string = "", forceLogin: boolean = false) {
      const callbackUrl = `${
         window.location.hostname !== "localhost" ? "https" : "http"
      }://${window.location.host}${window.location.pathname}`;
      return new PocketDataSource({
         redirectUrl: callbackUrl,
         accessToken,
         forceLogin
      });
   }

   static sampleDs() {
      return new SampleDataSource({
         file: "json/sample.json",
         redirectUrl: ""
      });
   }

   static async myjsonDs(key: string) {
      const sl = await new MyJsonConverter().import(key);
      const results = Bookmarks.fromMetadata(sl.bookmarks);
      return new ResultDataSource(results, sl.creator, "MyJSON");
   }

   static jsonDs(json: string) {
      const sl = new JsonConverter().import(json);
      const results = Bookmarks.fromMetadata(sl.bookmarks);
      return new ResultDataSource(results, sl.creator, "JSON");
   }

   static async createDataSource(params: {
      [key: string]: string;
      mode?: "myjson" | "sample" | "pocket";
   }): Promise<ApiDataSource> {
      // Override querystring with passed parameters
      params = $.extend(querystring(), params);
      switch (params["mode"]) {
         case "myjson":
            return await this.myjsonDs(params["key"]);
         case "sample":
            return this.sampleDs();
         default:
            return this.pocketDs(params["access"], params["login"] === "1");
      }
   }

   static async createApi(datasource: ApiDataSource) {
      await datasource.authorize();
      return new BookmarkApi(datasource);
   }
}

export interface IRetrieveEventArgs {
   results: Bookmarks;
   params: IRetrieveParameters;
}

export interface IActionEventArgs {
   actions: IActionParameters[];
}

export abstract class ApiDataSource {
   /* OVERWRITE THESE */

   protected _username: string;
   readonly label: string = "Bookmarks";
   abstract get connected(): boolean;
   abstract get readonly(): boolean;
   abstract async retrieve(params: IRetrieveParameters): Promise<Bookmarks>;
   abstract async action(actions: IActionParameters[]): Promise<void>;

   async authorize(): Promise<void> {
      return await $.when();
   }

   /* OVERWRITE THESE */

   get username() {
      return this._username;
   }

   protected mapObjProperties(
      src: Object,
      shouldAdd: boolean | ((key: string, value: any) => boolean),
      map: (key: string, value: any) => any
   ) {
      const shouldAddFn =
         typeof shouldAdd === "boolean" ? () => shouldAdd : shouldAdd;
      const target = {};
      $.each(src, (k, v) => {
         if (shouldAddFn(k, v)) {
            target[k] = map(k, v);
         }
      });
      return target;
   }

   protected mapResults(response: { [key: string]: any }): Bookmarks {
      const includedFields: any = {
         authors: (authors: any) => $.map(authors, v => v.name),
         tags: (tags: { [key: string]: any }) => Object.keys(tags),
         image: (i: any) => (i || {}).src,
         excerpt: true,
         favorite: true,
         given_title: true,
         resolved_url: true,
         resolved_title: true,
         sort_id: true,
         status: true,
         item_id: true,
         top_image_url: true,
         time_added: true
      };

      // Conditionally filters and/or maps one object's properties into a new object
      const fieldMapper = this.mapObjProperties.bind(this);

      function mapItem(key: string, value: any) {
         const shouldIncludeField = (k: string, _: any) =>
            includedFields.hasOwnProperty(k);

         const mapField = (k: string, v: any) => {
            return $.isFunction(includedFields[k]) ? includedFields[k](v) : v;
         };

         value = $.extend(
            {
               tags: [],
               authors: [],
               image: "",
               top_image_url: ""
            },
            value
         );
         return fieldMapper(value, shouldIncludeField, mapField);
      }

      response = this.mapObjProperties(response.list, true, mapItem);
      return new Bookmarks(response);
   }
}

export class BookmarkApi {
   constructor(private _dataSource: ApiDataSource) {
      // Use with memory flag to get initial update.
      this.dataSourceChangedEvent.trigger();
   }

   get dataSource() {
      return this._dataSource;
   }
   set dataSource(value: ApiDataSource) {
      this._dataSource = value;
      this.dataSourceChangedEvent.trigger();
   }

   get readonly() {
      return this.dataSource.readonly;
   }

   get username() {
      return this.dataSource.username;
   }

   clone() {
      // Assumes an authorized datasource
      return new BookmarkApi(this.dataSource);
   }

   destroy() {}

   readonly dataSourceChangedEvent = new TypedEvent<BookmarkApi, void>(this);
   readonly retrieveEvent = new TypedEvent<BookmarkApi, IRetrieveEventArgs>(
      this
   );
   readonly actionEvent = new TypedEvent<BookmarkApi, IActionEventArgs>(this);

   /**
    * Retrieves a list of user data (https://getpocket.com/developer/docs/v3/retrieve).
    * @param {} params Optional parameters listed in API documentation.
    */
   async retrieve(params: IRetrieveParameters): Promise<Bookmarks> {
      const results = await this.dataSource.retrieve(params);
      this.retrieveEvent.trigger({ params, results });
      return results;
   }

   /**
    * Adds, modifies, or removes a bookmark (https://getpocket.com/developer/docs/v3/modify).
    * @param actions
    */
   async action(actions: IActionParameters[]): Promise<void> {
      await this.dataSource.action(actions);
      this.actionEvent.trigger({ actions });
   }

   createEditor() {
      return new PocketLinkEditor(this);
   }
}

export class PocketDataSource extends ApiDataSource {
   public readonly readonly = false;
   readonly label: string = "Pocket";
   private apiUrl =
      window.location.hostname === "localhost"
         ? "https://localhost:44350/api/pocket/"
         : "https://bookmarks.gldnr.com/api/pocket/";
   constructor(public settings: PocketApiSettings) {
      super();
      if (settings.forceLogin) {
         this.logout();
      } else if (settings.accessToken) {
         this.accessToken = settings.accessToken;
         this.username = "Imported User";
      }
   }

   async authorize() {
      console.log("authorize");
      try {
         if (this.connected) {
            return;
         } else if (this.requestToken) {
            await this.getAccessTokenFromRequestCode();
         } else {
            // STEPS 2/3 of api auth documentation
            const callback = await this.getRequestToken();
            window.location.href = callback;
         }
      } catch (err) {
         console.error(err);
         throw err;
      }
   }

   get connected() {
      return !!this.accessToken;
   }

   logout() {
      this.accessToken = null;
      this.username = null;
   }

   get requestToken() {
      return localStorage.getItem("pocket_request_token");
   }

   set requestToken(token) {
      localStorage.setItem("pocket_request_token", token || "");
   }

   get accessToken() {
      return localStorage.getItem("pocket_access_token");
   }

   set accessToken(token) {
      this.requestToken = "";
      localStorage.setItem("pocket_access_token", token || "");
   }

   get username() {
      return localStorage.getItem("pocket_username");
   }
   set username(username: string) {
      localStorage.setItem("pocket_username", username || "");
   }

   private async callPocket(page: string, data: any) {
      console.log("callPocket", page, data);

      eif(this.accessToken, token => {
         data.access_token = token;
      });

      return $.post({
         url: this.apiUrl + page,
         data: data,
         dataType: "json"
      }).then(
         function(response) {
            if (response.error) {
               throw new Error(response.error);
            }
            return response.content;
         },
         function(xhr, err, v) {
            throw new Error(err);
         }
      );
   }

   /**
    * Obtains and stores the API request token from Pocket.
    * (Step 2 from https://getpocket.com/developer/docs/authentication).
    *
    * @returns {string} The url that the user needs to visit to grant account access (access token).
    */
   async getRequestToken(): Promise<string> {
      console.log("getRequestToken");

      const response = await this.callPocket("requesttoken", {
         redirect_uri: this.settings.redirectUrl
      });

      this.requestToken = response.code;
      return response.url;
   }

   /**
    * Converts the API request token to an access token
    * after the user has authorized the app with Pocket.
    * (Step 5 from https://getpocket.com/developer/docs/authentication)
    */
   async getAccessTokenFromRequestCode() {
      console.log("exchangeRequestTokenForAccessToken");
      if (this.accessToken) {
         // Use the existing access token.
         return $.when();
      }

      if (!this.requestToken) {
         // The request token wasn't accepted.
         // TODO: move index.html to setting
         window.location.href = "index.html";
         return;
      }

      let response: any;
      try {
         response = await this.callPocket("AccessToken", {
            code: this.requestToken
         });
      } catch (err) {
         this.requestToken = null;
         throw err;
      }
      this.username = response.username;
      this.accessToken = response.access_token;
   }

   /**
    * Retrieves a list of user data (https://getpocket.com/developer/docs/v3/retrieve)
    * @param {} params Optional parameters listed in API documentation.
    */
   async retrieve(params: IRetrieveParameters) {
      console.log("retrieve", params);

      // Trim empty properties
      params = this.mapObjProperties(
         params,
         (_, v) => v === 0 || !v,
         (_, v) => v
      );

      // Set defaults
      params = $.extend({ detailType: "complete" }, params);
      let results = await this.callPocket("get", params);
      return this.mapResults(results);
   }

   async action(actions: IActionParameters[]) {
      console.log("action", actions);

      if (!this.connected) {
         throw new Error("The user is not authorized to make this API call.");
      }
      actions = Array.isArray(actions) ? actions : [actions];
      await this.callPocket("send", { actions: actions });
   }
}

/**
 * Creates a datasource based on a saved response directly from the Pocket api
 */
export class SampleDataSource extends ApiDataSource {
   public readonly connected = true;
   public readonly readonly = true;
   readonly label: string = "Sample";

   constructor(public settings: DebugPocketApiSettings) {
      super();
      this._username = "Sample User";
   }

   async retrieve(params: IRetrieveParameters) {
      console.log("retrieving: " + this.settings.file);
      let results = await $.getJSON(this.settings.file);
      return this.mapResults(results.content);
   }

   async action(actions: IActionParameters[]) {
      console.log("action", actions);
      throw new Error("This should never be called, as it's read only.");
   }
}

/**
 * A readonly data source using parsed link results
 */
export class ResultDataSource extends ApiDataSource {
   public readonly readonly = true;
   public readonly connected = true;
   readonly label: string;

   constructor(
      private results: Bookmarks,
      username: string = "Remote Data",
      sourceLabel = "Saved Results"
   ) {
      super();
      this.label = sourceLabel;
      this._username = username;
   }

   async retrieve(params: IRetrieveParameters) {
      return this.results;
   }

   async action(actions: IActionParameters[]) {
      console.log(actions);
      throw new Error("This should never be called, as it's read only.");
   }
}

export class PocketLinkEditor {
   private parameters: IActionParameters[] = [];
   private undo: (() => void)[] = [];

   constructor(private api: BookmarkApi) {}

   async saveChanges() {
      if (this.parameters.length) {
         try {
            await this.api.action(this.parameters);
         } catch (err) {
            this.undo.forEach(fn => fn());
         }
      }
      this.parameters = [];
      this.undo = [];
   }

   private enqueueCall(
      item_id: string,
      action: string,
      params: {
         data?: any;
         undo?: false | (() => void);
      } = {}
   ) {
      this.parameters.push({ item_id, action, ...(params.data || {}) });
      params.undo && this.undo.push(params.undo);
      return this;
   }

   setArchive(data: ILinkData, value: boolean) {
      const origVal = data.status;
      data.status = value ? "1" : "0";

      // WARNING: There's a third "to delete" state unaccounted for.
      return this.enqueueCall(data.item_id, value ? "archive" : "readd", {
         undo: () => (data.status = origVal)
      });
   }

   delete(item_id: string) {
      return this.enqueueCall(item_id, "delete");
   }

   setFavorite(data: ILinkData, value: boolean) {
      const origVal = data.favorite;
      data.favorite = value ? "1" : "0";

      return this.enqueueCall(data.item_id, value ? "favorite" : "unfavorite", {
         undo: () => (data.favorite = origVal)
      });
   }

   setTags(data: ILinkData, tags: string[]) {
      const originalTags = data.tags;
      data.tags = [...tags];

      return this.enqueueCall(data.item_id, "tags_replace", {
         undo: () => (data.tags = originalTags)
      });
   }

   addTags(data: ILinkData, tags: string[]) {
      const originalTags = data.tags;
      data.tags = [...SetOps.union(new Set(data.tags), new Set(tags))];
      data.tags.sort();

      return this.enqueueCall(data.item_id, "tags_add", {
         data: { tags: tags.join() },
         undo: () => (data.tags = originalTags)
      });
   }

   removeTags(data: ILinkData, tags: string[]) {
      const originalTags = data.tags;
      data.tags = [...SetOps.difference(new Set(data.tags), new Set(tags))];
      data.tags.sort();

      return this.enqueueCall(data.item_id, "tags_add", {
         data: { tags: tags.join() },
         undo: () => (data.tags = originalTags)
      });
   }

   add(data: ILinkMetadata) {
      return this.enqueueCall(null, "add", {
         data: {
            tags: data.tags.join() || "",
            title: data.given_title,
            url: data.resolved_url,
            time: data.time_added
         }
      });
   }

   async importFromMetadata(metadata: ILinkMetadata[], chunkSize = 50) {
      let counter = 0;
      const links = [...metadata];

      while (links.length) {
         const link = links.pop();
         this.add(link);

         if (!links.length || ++counter % chunkSize === 0) {
            await this.saveChanges();
         }
      }
   }
}

/**
 * The most basic information needed per bookmark for serialization.
 */
export interface ILinkMetadata {
   tags?: string[];
   resolved_url?: string;
   given_title?: string;
   time_added?: number;
}

export interface ILinkData extends ILinkMetadata {
   [key: string]: any;
   item_id?: string;
   authors?: string[];
   image?: string;
   exerpt?: string;
   favorite?: string;
   resolved_title?: string;
   sort_id?: string;
   status?: string;
   top_image_url?: string;
}

export interface DebugPocketApiSettings extends PocketApiSettings {
   file: string;
}

export interface IRetrieveParameters {
   /** unread, archive, all */
   state?: string;
   /** 0,1 */
   favorite?: string;
   tag?: string;
   /** article, video, image */
   contentType?: string;
   /** newest, oldest, tile, site */
   sort?: string;
   /** simple, complete */
   detailType?: string;
   search?: string;
   domain?: string;
   since?: number;
   count?: number;
   offset?: number;
}

export interface IActionParameters {
   action: string;
   tags?: string;
   time?: number;
   title?: string;
   url?: string;
   item_id: string;
   old_tag?: string;
   new_tag?: string;
}
