export interface BookmarkData {
   [key: string]: any;
   id: string;
   tags: string[];
   url: string;
   title: string;
   added: number;

   // Pocket
   authors?: string[];
   resolvedUrl?: string;
   image?: string;
   favorite?: boolean;
   archive?: boolean;
   excerpt?: string;
}

export enum BookmarkSortField {
   url, title, date
}

export type BookmarkCollection = { [id: string]: BookmarkData };

export const toBookmarkCollection = (bookmarks: BookmarkData[]) => 
   bookmarks.reduce((acc, val) => {
      acc[val.id] = val;
      return acc;
   },
   {} as BookmarkCollection);

export const toBookmarkArray = (bookmarks: BookmarkCollection) => Object.values(bookmarks);
