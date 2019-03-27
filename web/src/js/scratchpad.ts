({
   plugins: ["jsdom-quokka-plugin"],
   jsdom: { html: '<div id="container">' },
   ts: {
      path: "...typescript"
   }
});

interface RetrieveParameters4 {
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

export function filterObject(
   obj: { [key: string]: any },
   filter: (k: string, v: any) => boolean
) {
   const copy: any = {};
   Object.keys(obj).forEach(k => {
      const v = obj[k];
      if (filter(k, v)) {
         copy[k] = v;
      }
   });
   return copy;
}

const r: RetrieveParameters4 = {
   contentType: "article",
   since: undefined
};

const r2 = filterObject(r, (k, v) => v !== null && v !== undefined);

console.log(r);
console.log(r2);
