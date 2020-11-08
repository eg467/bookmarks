//import axios from 'axios';
import { BookmarkCollection, BookmarkData } from '../redux/bookmarks/bookmarks';
import { BookmarkSourceType } from '../redux/bookmarks/reducer';
import { AddBookmarkError, AddBookmarkInput, AddBookmarkResult, BookmarkPersister, TagModification } from './bookmark-io';
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
        return import("../data/sample.json")
            .then(results => results.content.list)
            .then(b => this.toBookmarks(b));
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

    private batchModification(ids: string | string[], action: string, otherParams?: Partial<ActionParameters>) {
        if (!Array.isArray(ids)) {
            ids = [ids];
        }
        const actions = ids.map(item_id => <ActionParameters>({ item_id, action, ...otherParams }));
        return this.bookmarkModification(actions).then(r => {
            let errors = r.action_errors;
            if (Array.isArray(errors)) {
                errors = errors.filter(e => e).map(e => `${e.type} (${e.message})`);
                throw new Error(errors.join(".  ") + ".");
            }

            if (typeof r.status === "number" && r.status !== 1) {
                throw new Error("The API request completed, but there was a server error processing that request.");
            }
        });
    }

    /* POCKET ACTIONS */
    async add(bookmarkSeed: AddBookmarkInput | AddBookmarkInput[]) {
        const bookmarkSeeds: AddBookmarkInput[] = Array.isArray(bookmarkSeed) ? bookmarkSeed : [bookmarkSeed];

        var actions = bookmarkSeeds.map(b => <ActionParameters>({
            action: "add",
            "url": b.url,
            "tags": b.tags.join(",")
        }));

        return this.bookmarkModification(actions).then(r => {
            const { action_results: returnedBookmarks, action_errors: actionErrors, status } = r.data;
            var errors = actionErrors.map((e: any, i: number) => ({
                message: `${e.type}: ${e.message}`,
                index: i,
                input: bookmarkSeeds[i]
            }));

            if (!status || errors.length) {
                throw errors;
            }

            return returnedBookmarks.map((b: any) => ({ item_id: b.item_id }));
        })
    }

    remove(keys: string | string[]) {
        return this.batchModification(keys, "delete");
    }

    archive(keys: string | string[], status: boolean) {
        return this.batchModification(keys, status ? "archive" : "readd");
    }

    favorite(keys: string | string[], status: boolean) {
        return this.batchModification(keys, status ? "favorite" : "unfavorite");
    }

    /**
     * Replaces current tags for bookmarks.
     * @param key The bookmark id
     * @param tags A comma-delimited list of tags
     */
    setTags(keys: string | string[], tags: string) {
        return this.batchModification(keys, "tags_replace", { tags });
    }

    /**
     * Replaces current tags for bookmarks.
     * @param key The bookmark id
     * @param tags A comma-delimited list of tags
     * @param operation What to do with the provided tags
     */
    modifyTags(keys: string | string[], tags: string, operation: TagModification) {
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
        return this.bookmarkModification({ action: "tag_rename", old_tag: oldTag, new_tag: newTag });
    }

    /**
      * Delete a tag. This affects all items with this tag.
      * @param tag The name of the tag to delete.
      */
    deleteTag(tag: string) {
        return this.bookmarkModification({ action: "tag_delete", tag });
    }

    /* END POCKET ACTIONS */
}

const pocketApi = new PocketApi("api/pocket/", "/authenticated");
export default pocketApi;