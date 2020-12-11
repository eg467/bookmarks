import {BookmarkCollection, BookmarkData} from "./redux/bookmarks/bookmarks";

export class SetOps {
   private static sortSetsBySize<T>(a: ReadonlySet<T>, b: ReadonlySet<T>) {
      return a.size < b.size ? [a,b] : [b,a];
   }
   static union<T>(a: ReadonlySet<T>, b: ReadonlySet<T>): Set<T> {
      const [s,l] = SetOps.sortSetsBySize(a,b);
      return new Set(s === l ? s  : [...s, ...l]);
   }
   static intersection<T>(a: ReadonlySet<T>, b: ReadonlySet<T>): Set<T> {
      const [s,l] = SetOps.sortSetsBySize(a,b);
      return new Set(s === l ? s : [...s].filter((x) => l.has(x)));
   }
   static difference<T>(a: ReadonlySet<T>, b: ReadonlySet<T>): Set<T> {
      return new Set([...a].filter((x) => !b.has(x)))
   }
   static map<T, TDest>(set: ReadonlySet<T>, fn: (x: T) => TDest) {
      return new Set([...set].map(fn))
   }
   static reduce<T>(
      sets: Set<T>[],
      fn: (a: ReadonlySet<T>, b: ReadonlySet<T>) => Set<T>,
   ): Set<T> {
     return (sets.length ? sets.reduce(fn) : new Set<T>()); 
   } 
}

export const ciCollator = new Intl.Collator("en-US", { sensitivity: "accent" });
export const ciEquals = (a: string, b: string) => ciCollator.compare(a, b) === 0;

export const standardizeUrl = (url: string) => {
   url = url.indexOf("://") >= 0 ? url : "https://";
   // Throws error if invalid.
   const u = new URL(url);
   return u.href;
};

export const deduplicate = <T>(items: T[]) => [...new Set(items)];
export const removeNulls = <T>(items: Nullable<T>[]) => {
   return items.filter(x => x !== null) as T[];
};

export const getHostName = (url: string): Nullable<string> => {
   try {
      const a = document.createElement("a");
      a.href = url;
      return a.host;
   } catch(_) {
      return null;
   }
}

let currentBookmarkIndex = 0;
const idToString = (id: number) => String(id).padStart(4, "0");
export const newId = (collection?: BookmarkCollection|BookmarkData[]): string => {
   const hasId = !collection
      ? (id: string) => false
      : Array.isArray(collection)
         ? (id: string) => collection.some(x => x.id === id)
         : (id: string) => !!collection[id];
   
   let newValue: string;
   while(hasId(newValue = idToString(currentBookmarkIndex++))) {}
   return newValue;
}



export const htmlDecoder = () => {
   const txt = document.createElement("textarea");
   return (html: string) => {
      txt.innerHTML = html;
      return txt.value;
   };
};

// https://stackoverflow.com/a/27385169, safe for XSS
export const decodeHtml = (html: string) => {
   const doc = new DOMParser().parseFromString(html, "text/html");
   return doc.documentElement.textContent || "";
};

export const htmlEncoder = () => {
   const txt = document.createElement("textarea");
   return (text: string) => {
      txt.appendChild(document.createTextNode(text));
      const html = txt.innerHTML;
      txt.innerHTML = "";
      return html;
   };
};
//
// export const escapeHtml = (text: string) => {
//    let txt = document.createElement("textarea");
//    txt.appendChild(document.createTextNode(text));
//    return txt.innerHTML;
// };

export function downloadFile(filename: string, contents: string) {
   const element = document.createElement("a");

   const mimeTypes: any = {
      csv: "text/csv",
      html: "text/html",
      json: "application/json",
      txt: "text/plain"
   };
   const extension = filename.split(".").pop() || "txt";
   const mimeType = mimeTypes[extension];

   element.setAttribute(
      "href",
      `data:${mimeType};charset=utf-8,${encodeURIComponent(contents)}`
   );
   element.setAttribute("download", filename);
   element.style.display = "none";
   document.body.appendChild(element);
   element.click();
   document.body.removeChild(element);
}

export type SettledPromise<T> = {status:"fulfilled",value:T} | {status:"rejected",reason:any}; 
export const allSettled = <T>(
   promises: Promise<T>[]
):  Promise<(SettledPromise<T>)[]> =>
   Promise.all(
      promises.map(p => p.then(
         value => ({status: "fulfilled", value} as SettledPromise<T>),
         reason => ({status: "rejected", reason} as SettledPromise<T>)
      ))
   );

export const yyyymmdd = (date: Date = new Date()) => {
   const y = date.getFullYear().toString();
   let m = (date.getMonth() + 1).toString();
   let d = date.getDate().toString();
   (d.length == 1) && (d = '0' + d);
   (m.length == 1) && (m = '0' + m);
   return y + m + d;
}