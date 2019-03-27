// https://stackoverflow.com/questions/40948294/how-to-extend-jquery-functions-in-typescript

interface JQuery {
   exists: () => boolean;
   applyClass: (className: string, apply: boolean) => JQuery<HTMLElement>;
   tagify: (...args: any[]) => JQuery<HTMLElement>;

   /**
    * Like JQuery.find(selector) except it includes the original items in the search.
    */
   findSelf: (selector: string) => JQuery<HTMLElement>;

   btnclick: (
      handler: ($sender: JQuery<HTMLElement>) => any,
      preventDefault?: boolean,
      stopPropagation?: boolean
   ) => JQuery<HTMLElement>;
}
