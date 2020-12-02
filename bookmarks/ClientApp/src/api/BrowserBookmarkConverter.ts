import {BookmarkCollection, BookmarkData} from "../redux/bookmarks/bookmarks";
import {newId, escapeHtml, decodeHtml} from "../utils";
import {standardizeTags} from "../redux/bookmarks/reducer";
import { isUrl } from "./bookmark-io";

export type GenericNode<T> = {
   id: string;
   label: string;
   parent: Nullable<GenericNode<T>>;
   children: GenericNode<T>[];
   values: T[];
}

export type BrowserBookmarkTree = GenericNode<BookmarkData>;



export function getBookmarkDirs(currentNode: BrowserBookmarkTree, rootNode: BrowserBookmarkTree) {
   const dirs = [];
   while(currentNode.parent && currentNode !== rootNode) {
      dirs.push(currentNode.label);
      currentNode = currentNode.parent;
   }
   dirs.push(currentNode.label);
   return dirs;
}

export function* treeIterator<T>(root: GenericNode<T>) {
   let nodeQueue: GenericNode<T>[] = [root];
   let node: GenericNode<T> | undefined;
   while(node = nodeQueue.shift()) {
      yield node;
      Object.values(node.children).forEach(n => nodeQueue.push(n));
   }
}


export type AggregateBookmarksOptions = {
   subdirsAsTags?: boolean;
   addedTags?: string[];
   removedTags?: string[];
   preserveTimestamps?: boolean;
   includeBookmark: (bookmark: BookmarkData) => boolean;
}

export const bookmarkTreeToCollection = (
   root: BrowserBookmarkTree, 
   {
      addedTags = [],
      removedTags = [],
      subdirsAsTags = false,
      preserveTimestamps = true,
      includeBookmark
   }: AggregateBookmarksOptions
): BookmarkCollection => {
   
   let bookmarks: BookmarkCollection = {};
   
   const getDirsToRoot = (n: BrowserBookmarkTree) => getBookmarkDirs(n, root);
   
   const mapBookmark = (n: BrowserBookmarkTree, b: BookmarkData) => {
      b = {...b};
      b.tags = [...b.tags, ...addedTags];
      if(subdirsAsTags) {
         b.tags.push(...getDirsToRoot(n));
      }
      b.tags = b.tags.filter(t => !removedTags.some(rt => t === rt));
      b.tags = standardizeTags(b.tags);
      if(!b.added || !preserveTimestamps) {
         b.added = new Date().getTime()
      }
      return b;
   };

   for(const node of treeIterator<BookmarkData>(root)){
      const bookmarksInDir = node.values.map(b => mapBookmark(node as BrowserBookmarkTree, b));
      bookmarksInDir.filter(includeBookmark).forEach(b => bookmarks[b.id] = b);
   }
   return bookmarks;
}

export type importHtmlOptions = {
   preserveTimestamps?: boolean;
}

export const importHtml = (
   serializedBookmarks: string, 
   {
      preserveTimestamps = true,
   } : importHtmlOptions
): BrowserBookmarkTree => {
      const rootNode: BrowserBookmarkTree = {
         id: newId(),
         label: "Imported Bookmarks",
         parent: null,
         values: [],
         children: []
      }
   
      let dirStack: BrowserBookmarkTree[] = [rootNode];
      let getCurrentNode = () => dirStack[dirStack.length-1];
   
      const htmlPattern = new RegExp(/(<DT><H3[^>]*>([^<]+)<\/H3>)|(<DT>\s*<A[^>]*>([^<]+)<\/A>)|(<\/DL>)/gims);
      const nextMatch = () => htmlPattern.exec(serializedBookmarks); 
      
      
      
      let matches = nextMatch();
      while (matches) {
         const parentNode = getCurrentNode();

         // TODO: Remove
         const indent = (str: string) => "".padStart(3 * dirStack.length, "|--") + str;
         
         if(matches[1] && matches[2]) {
            const dir = matches[2];
            const node: BrowserBookmarkTree = {
               id: newId(),
               parent: parentNode,
               label: dir, 
               children: [],
               values: []
            };
            parentNode.children.push(node);

            console.log(indent(`DIR: ${node.label}`));
            
            dirStack.push(node);
            
         } else if(matches[3] && matches[4]) {
            const url = matches[3];
            const title = decodeHtml(matches[4]);
            const link = parseLink(url, title);
            parentNode.values.push(link);
         } else if(matches[5]) {
            dirStack.pop();
         }
         matches = nextMatch();
      }
      return rootNode;

      function parseLink(link: string, title: string): BookmarkData {
         const pattern = /(HREF="([^"]+)"|ADD_DATE="([^"]+)"|TAGS="([^"]+)")/gi;
         let added: number = new Date().getTime();
         let url: string = "";
         let tags: string[] = [];
         let m = pattern.exec(link);
         while(!!m) {
            if(m[2] && preserveTimestamps) {
               // Stored in chrome as seconds after epoch
               url = m[2];
            } else if(m[3]) {
               added = Number.parseInt(m[3], 10) * 1000;
            } else if(m[4]) {
               tags = standardizeTags(m[4].split(","));
            }
            m = pattern.exec(link);
         }

         if(!isUrl(url)) {
            throw Error("Invalid URL: " + url);
         }

         return { id: newId(), title, added, url, tags: standardizeTags(tags) };
      }
}


export type ExportBookmarksOptions = {
   targetDirectory?: string;
   treatTagsAsFolders?: boolean;
   preserveTimestamps?: boolean;
}

/**
 * Returns HTML that can be imported into firefox to create browser bookmarks.
 * @param bookmarks
 * @param options
 */
export const exportBookmarks = (
   bookmarks: BookmarkData[], 
   {
      targetDirectory = "Synced Pocket Bookmarks",
      treatTagsAsFolders = true,
      preserveTimestamps = true,
   }: ExportBookmarksOptions
) => {

   if (treatTagsAsFolders) {
      return serializeInTagFolders();
   } else {
      return serializeInOneFolder();
   }

   // HELPER FUNCTIONS
   function serializeInTagFolders(): string  {
      return serializeBody(html => {
         const bookmarksByTag = getBookmarksByTag();
         if(targetDirectory) {
            html.push(exportFolder(targetDirectory));   
         }
         for (const tag of Object.keys(bookmarksByTag)) {
            html.push(exportFolder(tag));
            html.push(...serializeLinks(bookmarksByTag[tag]));
         }
      });
   }
   
   function getBookmarksByTag(): {[tag: string]: BookmarkData[]} {
      const bookmarksByTag: {[tag: string]: BookmarkData[]} = {};
      function addToBookmarksByTag(tag: string, bm: BookmarkData) {
         if(bookmarksByTag[tag]) {
            bookmarksByTag[tag].push(bm);
         } else {
            bookmarksByTag[tag] = [bm];
         }
      }
      bookmarks.forEach(b => b.tags.forEach(t => addToBookmarksByTag(t, b)));
      return bookmarksByTag;
   }

   function serializeInOneFolder(): string {
      return serializeBody(html => {
         if(targetDirectory) {
            html.push(exportFolder(targetDirectory));
         }
         html.push(...serializeLinks(bookmarks));            
      });
   }

   /**
    * 
    * @param createBody Build the bookmark file body by appending to this array of HTML.
    */
   function serializeBody(createBody: (existing: string[]) => void) {
      const arr: string[] = [];
      arr.push(`<!DOCTYPE NETSCAPE-Bookmark-file-1>
         <META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
         <TITLE>Bookmarks</TITLE>
         <H1>Bookmarks Menu</H1>
         <DL>
         `);
      createBody(arr);
      arr.push(`</DL>`);
      return arr.join("");
   }

   function serializeLinks(links: BookmarkData[]): string[] {
      return [`<DL><p>`, ...links.map(exportLink), `</DL>`];
   }

   function exportFolder(dir: string) {
      return `
         <p>
            <DT>
               <H3>${dir}</H3>
         `;
   }

   function exportLink(link: BookmarkData) {
      const time = preserveTimestamps ? link.added : new Date().getTime();
      return `
      <DT><A HREF="${link.resolved_url}" ADD_DATE="${time}" LAST_MODIFIED="${time}"
         TAGS="${link.tags.join()}">${link.title}</A>
      `;
   }
}