//import axios from 'axios';
import { BookmarkCollection, BookmarkData } from '../redux/bookmarks/bookmarks';
import { BookmarkSourceType, FailedIndividualRequest, PartialSuccessResult } from '../redux/bookmarks/reducer';
import { AddBookmarkError, AddBookmarkInput, BookmarkKeys, BookmarkPersister, TagModification, toArray } from './bookmark-io';
import storage from "./local-storage";

export interface PocketAuthState {
    requestToken: string;
    accessToken: string;
    username: string;
}

export interface RetrieveParameters {
    /** unread, archive, all */
    state?: "unread" | "archive" | "all";
    /** 0,1 */
    favorite?: "0" | "1";
    tag?: string;
    /** article, video, image */
    contentType?: "article" | "video" | "image";
    /** newest, oldest, tile, site */
    sort?: "newest" | "oldest" | "tile" | "site";
    /** simple, complete */
    detailType?: "simple" | "complete";
    search?: string;
    domain?: string;
    since?: number;
    count?: number;
    offset?: number;
}

export interface ActionParameters {
    action: string;
    time?: number;
    title?: string;
    url?: string;
    item_id?: string;
    tag?: string;
    tags?: string;
    old_tag?: string;
    new_tag?: string;
}

export interface AuthState {
    requestToken?: string;
    accessToken?: string;
    username?: string;
}

type PocketApiPage = "add" | "get" | "send" | "oauth/request" | "oauth/authorize";

export class PocketApi implements BookmarkPersister {
    public readonly sourceType = BookmarkSourceType.pocket;

    private redirectionUri: string;

    //public get authState() {
    //    return this.authStorage.get();
    //}

    private readonly authStorage = storage.fieldStorage<Partial<PocketAuthState>>(
        "pocket_auth",
        {
            accessToken: "",
            requestToken: "",
            username: ""
        }
    );

    public get username() {
        return this.authStorage.get().username || "";
    }

    public get isAuthenticated() {
        return !!this.authStorage.get().accessToken;
    }

    public get requiresAuthorization() {
        return !!this.authStorage.get().requestToken;
    }

    /**
     * @param apiUri The path of the Web API controller that proxies calls to Pocket.
     * @param redirectionPath The path relative to the domain that Pocket should redirect to after user grants authorization.
     */
    constructor(public apiUri: string, redirectionPath: string) {
        this.redirectionUri = window.location.origin + redirectionPath;
        this.apiUri = this.apiUri.replace(/\/+$/g, "")
    }

    callPocket(page: PocketApiPage, data: any) {
        return fetch(`${this.apiUri}/${page}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data || {})
        }).then(res => res.json());
    }

    private authenticatedCall(page: PocketApiPage, data: any) {
        data.access_token = this.authStorage.get().accessToken;
        return this.callPocket(page, data);
    }

    /**
    * Obtains and stores the API request token from Pocket.
    * (Step 2 from https://getpocket.com/developer/docs/authentication).
    */
    getRequestToken(): Promise<void> {
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
    private redirectUserToPocketAuthorization(requestToken: string) {
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
    retrieve(params: RetrieveParameters) {
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
            
            
            
            .then((results: any) => results.content.list)
            .then((b: any) => this.toBookmarks(b));
    }

    logout() {
        this.authStorage.clear();
    }

    private toBookmarks(rawBookmarks: any) {
        console.log(rawBookmarks);

        const bookmarks: BookmarkCollection = {};
        for (const bookmark of Object.values<any>(rawBookmarks)) {
            bookmarks[bookmark.item_id] = {
                id: bookmark.item_id,
                tags: bookmark.tags ? Object.keys(bookmark.tags) : [],
                url: bookmark.resolved_url,
                title: bookmark.given_title,
                added: parseInt(bookmark.time_added, 10),
                authors: bookmark.authors ? Object.values(bookmark.authors).map((v: any) => v.name) : [],
                image: bookmark.top_image_url || [
                    ...(Object.values(bookmark.images || {}).map((v: any) => v.src)),
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
    private bookmarkModification(actions: ActionParameters | ActionParameters[]) {
        console.log("Pocket API action", actions);
        actions = Array.isArray(actions) ? actions : [actions];
        return this.authenticatedCall("send", { actions: actions });
    }

    /**
     * Separate the individually successful vs failed action requests.
     * @param getKey Retrieves the system key
     * @param responseData The raw json object returned from the (proxy) server
     */
    private parseBatchActionResponse(
        getKey: (result: any, index: number) => string,
        responseData: { action_errors: any[], action_results: any[], status: number }): PartialSuccessResult {
        const { action_results: results, action_errors: errors, status } = responseData;

        if (!Array.isArray(errors)
            || !Array.isArray(results)
            || errors.length !== results.length) {
            throw new Error("Failure parsing the Pocket API response. The request may or may not have been successful.");
        }

        if (status != 1) {
            throw new Error("The server responded, but it indicated an operation failure.");
        }

        const key = (i: number) => getKey(results[i], i);

        const successfulIds = results
            .map((x, i) => x ? key(i) : null)
            .filter((x): x is string => (x !== null));

        const failureIds = errors
            .map((x, i) => x ? { id: key(i), error: `${x.type}: ${x.error}` } as FailedIndividualRequest : null)
            .filter((x): x is FailedIndividualRequest => x !== null);

        return {
            dirtyChange: failureIds.length > 0,
            successfulIds,
            failureIds,
        };
    }

    private validateSingleActionResult(responseData: { action_errors: any[], action_results: any[], status: number }, message: string) {
        const { action_results: results, action_errors: errors, status } = responseData;
        if (
            !Array.isArray(results) || !Array.isArray(errors)
            || results.length !== 1 || errors.length !== 1
            || !results[0] || errors[0]) {
            throw new Error(message);
        }
    }

    private batchModification(id: BookmarkKeys, action: string, otherParams?: Partial<ActionParameters>) {
        const ids = toArray(id);
        const actions = ids.map(item_id => <ActionParameters>({ item_id, action, ...otherParams }));
        return this.bookmarkModification(actions).then(r => this.parseBatchActionResponse((_, i) => ids[i], r.data));
    }

    /* POCKET ACTIONS */
    async add(bookmarkSeed: AddBookmarkInput | AddBookmarkInput[]) {
        const bookmarkSeeds: AddBookmarkInput[] = Array.isArray(bookmarkSeed) ? bookmarkSeed : [bookmarkSeed];

        var actions = bookmarkSeeds.map(b => <ActionParameters>({
            action: "add",
            "url": b.url,
            "tags": b.tags.join(",")
        }));

        return this.bookmarkModification(actions).then(
            r => this.parseBatchActionResponse((x, _) => x.item_id, r.data))
    }

    remove(keys: BookmarkKeys) {
        return this.batchModification(keys, "delete");
    }

    archive(keys: BookmarkKeys, status: boolean) {
        return this.batchModification(keys, status ? "archive" : "readd");
    }

    favorite(keys: BookmarkKeys, status: boolean) {
        return this.batchModification(keys, status ? "favorite" : "unfavorite");
    }
    /**
     * Replaces current tags for bookmarks.
     * @param key The bookmark id
     * @param tags A comma-delimited list of tags
     * @param operation What to do with the provided tags
     */
    modifyTags(keys: BookmarkKeys, tags: string, operation: TagModification) {
        const apiCommandByOp = {
            [TagModification.set]: "tags_replace",
            [TagModification.add]: "tags_add",
            [TagModification.remove]: "tags_remove",
        }
        return this.batchModification(keys, apiCommandByOp[operation], { tags });
    }

    /**
     * Rename a tag. This affects all items with this tag.
     * @param oldTag
     * @param newTag
     */
    renameTag(oldTag: string, newTag: string) {
        return this.bookmarkModification({ action: "tag_rename", old_tag: oldTag, new_tag: newTag })
            .then(r => {
                this.validateSingleActionResult(r.data, `Failed to rename tag from ${oldTag} to ${newTag}.`);
            });
    }

    /**
      * Delete a tag. This affects all items with this tag.
      * @param tag The name of the tag to delete.
      */
    deleteTag(tag: string) {
        return this.bookmarkModification({ action: "tag_delete", tag })
            .then(r => {
                this.validateSingleActionResult(r.data, `Failed to delete tag ${tag}.`);
            });
    }

    /* END POCKET ACTIONS */
}

const pocketApi = new PocketApi("api/pocket/", "/authenticated");
export default pocketApi;