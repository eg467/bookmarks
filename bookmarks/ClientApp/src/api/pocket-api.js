import { BookmarkSourceType } from '../redux/bookmarks/reducer';
import { TagModification, toArray } from './bookmark-io';
import storage from "./local-storage";
export class PocketApi {
    /**
     * @param apiUri The path of the Web API controller that proxies calls to Pocket.
     * @param redirectionPath The path relative to the domain that Pocket should redirect to after user grants authorization.
     */
    constructor(apiUri, redirectionPath) {
        this.apiUri = apiUri;
        this.sourceType = BookmarkSourceType.pocket;
        //public get authState() {
        //    return this.authStorage.get();
        //}
        this.authStorage = storage.fieldStorage("pocket_auth", {
            accessToken: "",
            requestToken: "",
            username: ""
        });
        this.redirectionUri = window.location.origin + redirectionPath;
        this.apiUri = this.apiUri.replace(/\/+$/g, "");
    }
    get username() {
        return this.authStorage.get().username || "";
    }
    get isAuthenticated() {
        return !!this.authStorage.get().accessToken;
    }
    get requiresAuthorization() {
        return !!this.authStorage.get().requestToken;
    }
    callPocket(page, data) {
        return fetch(`${this.apiUri}/${page}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data || {})
        }).then(res => res.json());
    }
    authenticatedCall(page, data) {
        data.access_token = this.authStorage.get().accessToken;
        return this.callPocket(page, data);
    }
    /**
    * Obtains and stores the API request token from Pocket.
    * (Step 2 from https://getpocket.com/developer/docs/authentication).
    */
    getRequestToken() {
        return this.callPocket("oauth/request", {
            redirect_uri: this.redirectionUri
        }).then(r => {
            const requestToken = r.data.code;
            this.authStorage.set({ requestToken });
            this.redirectUserToPocketAuthorization(requestToken);
        });
    }
    /**
     * Gets the URI on getpocket.com where the user must authorize our app.
     * (Step 3 from https://getpocket.com/developer/docs/authentication)
     */
    redirectUserToPocketAuthorization(requestToken) {
        const encodedRedirectUri = encodeURIComponent(this.redirectionUri);
        window.location.href = `https://getpocket.com/auth/authorize?` +
            `request_token=${requestToken}&redirect_uri=${encodedRedirectUri}`;
    }
    /**
     * Converts the API request token to an access token
     * after the user has authorized the app with Pocket.
     * (Step 5 from https://getpocket.com/developer/docs/authentication)
     */
    async getAccessTokenFromRequestToken() {
        var requestToken = this.authStorage.get().requestToken;
        if (!requestToken) {
            throw new Error("No request token provided.");
        }
        let response = await this.callPocket("oauth/authorize", { code: requestToken });
        const result = {
            username: response.data.username,
            accessToken: response.data.access_token
        };
        this.authStorage.set(result);
        return result;
    }
    /**
     * Retrieves a list of user bookmarks (https://getpocket.com/developer/docs/v3/retrieve)
     * @param {} params Optional parameters listed in API documentation.
     */
    retrieve(params) {
        params = Object.assign({ detailType: "complete" }, params);
        return this.authenticatedCall("get", params)
            .then(results => results.data.list)
            .then(b => this.toBookmarks(b));
    }
    refresh() {
        return this.retrieve({});
    }
    /**
     * Retrieve a hard-coded json sample of Pocket results for non-user demo.
     */
    retrieveSample() {
        return require("../data/sample.json")
            .then((results) => results.content.list)
            .then((b) => this.toBookmarks(b));
    }
    logout() {
        this.authStorage.clear();
    }
    toBookmarks(rawBookmarks) {
        console.log(rawBookmarks);
        const bookmarks = {};
        for (const bookmark of Object.values(rawBookmarks)) {
            bookmarks[bookmark.item_id] = {
                id: bookmark.item_id,
                tags: bookmark.tags ? Object.keys(bookmark.tags) : [],
                url: bookmark.resolved_url,
                title: bookmark.given_title,
                added: parseInt(bookmark.time_added, 10),
                authors: bookmark.authors ? Object.values(bookmark.authors).map((v) => v.name) : [],
                image: bookmark.top_image_url || [
                    ...(Object.values(bookmark.images || {}).map((v) => v.src)),
                    ""
                ][0],
                favorite: bookmark.favorite === "1",
                archive: bookmark.status === "1",
                excerpt: bookmark.excerpt
            };
        }
        return bookmarks;
    }
    /**
     * Modifies bookmarks in Pocket.
     * @param actions The actions according to https://getpocket.com/developer/docs/v3/modify
     * @param accessToken An overridnig access token or none supplied to use the cached token.
     */
    bookmarkModification(actions) {
        console.log("Pocket API action", actions);
        actions = Array.isArray(actions) ? actions : [actions];
        return this.authenticatedCall("send", { actions: actions });
    }
    /**
     * Separate the individually successful vs failed action requests.
     * @param getKey Retrieves the system key
     * @param responseData The raw json object returned from the (proxy) server
     */
    parseBatchActionResponse(getKey, responseData) {
        const { action_results: results, action_errors: errors, status } = responseData;
        if (!Array.isArray(errors)
            || !Array.isArray(results)
            || errors.length !== results.length) {
            throw new Error("Failure parsing the Pocket API response. The request may or may not have been successful.");
        }
        if (status != 1) {
            throw new Error("The server responded, but it indicated an operation failure.");
        }
        const key = (i) => getKey(results[i], i);
        const successfulIds = results
            .map((x, i) => x ? key(i) : null)
            .filter((x) => (x !== null));
        const failureIds = errors
            .map((x, i) => x ? { id: key(i), error: `${x.type}: ${x.error}` } : null)
            .filter((x) => x !== null);
        return {
            dirtyChange: failureIds.length > 0,
            successfulIds,
            failureIds,
        };
    }
    validateSingleActionResult(responseData, message) {
        const { action_results: results, action_errors: errors, status } = responseData;
        if (!Array.isArray(results) || !Array.isArray(errors)
            || results.length !== 1 || errors.length !== 1
            || !results[0] || errors[0]) {
            throw new Error(message);
        }
    }
    batchModification(id, action, otherParams) {
        const ids = toArray(id);
        const actions = ids.map(item_id => ({ item_id, action, ...otherParams }));
        return this.bookmarkModification(actions).then(r => this.parseBatchActionResponse((_, i) => ids[i], r.data));
    }
    /* POCKET ACTIONS */
    async add(bookmarkSeed) {
        const bookmarkSeeds = Array.isArray(bookmarkSeed) ? bookmarkSeed : [bookmarkSeed];
        var actions = bookmarkSeeds.map(b => ({
            action: "add",
            "url": b.url,
            "tags": b.tags.join(",")
        }));
        return this.bookmarkModification(actions).then(r => this.parseBatchActionResponse((x, _) => x.item_id, r.data));
    }
    remove(keys) {
        return this.batchModification(keys, "delete");
    }
    archive(keys, status) {
        return this.batchModification(keys, status ? "archive" : "readd");
    }
    favorite(keys, status) {
        return this.batchModification(keys, status ? "favorite" : "unfavorite");
    }
    /**
     * Replaces current tags for bookmarks.
     * @param key The bookmark id
     * @param tags A comma-delimited list of tags
     * @param operation What to do with the provided tags
     */
    modifyTags(keys, tags, operation) {
        const apiCommandByOp = {
            [TagModification.set]: "tags_replace",
            [TagModification.add]: "tags_add",
            [TagModification.remove]: "tags_remove",
        };
        return this.batchModification(keys, apiCommandByOp[operation], { tags });
    }
    /**
     * Rename a tag. This affects all items with this tag.
     * @param oldTag
     * @param newTag
     */
    renameTag(oldTag, newTag) {
        return this.bookmarkModification({ action: "tag_rename", old_tag: oldTag, new_tag: newTag })
            .then(r => {
            this.validateSingleActionResult(r.data, `Failed to rename tag from ${oldTag} to ${newTag}.`);
        });
    }
    /**
      * Delete a tag. This affects all items with this tag.
      * @param tag The name of the tag to delete.
      */
    deleteTag(tag) {
        return this.bookmarkModification({ action: "tag_delete", tag })
            .then(r => {
            this.validateSingleActionResult(r.data, `Failed to delete tag ${tag}.`);
        });
    }
}
const pocketApi = new PocketApi("api/pocket/", "/authenticated");
export default pocketApi;
