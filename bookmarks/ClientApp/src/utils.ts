
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