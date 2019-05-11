import { SetOps, eif } from "../utils";
import { PocketDataSource, ILinkData, BookmarkApi, IRetrieveEventArgs } from "./pocket-api";
import { Bookmarks } from "./Bookmarks";
import { TypedEvent } from "../views/view";

export class FilterChangedEventArgs { }

export default class FilterModel {
   private settings: any;
   public filters: {
      and: AndTagFilter;
      or: OrTagFilter;
      not: NotTagFilter;
      content: ContentFilter;
   };

   public resultsChangedEvent = new TypedEvent<FilterModel, void>(this);

   public filteredResults: Bookmarks;
   public fullResults: Bookmarks;

   private _api: BookmarkApi;
   private dataRetrievedHandler: (sender: BookmarkApi, args: IRetrieveEventArgs) => void;

   constructor(settings: any) {
      this.settings = $.extend(
         {
            mode: FilterMode.Filter
         },
         settings
      );

      this.dataRetrievedHandler = this.onDataRetrieved.bind(this);
      this.filters = {
         and: new AndTagFilter(),
         or: new OrTagFilter(),
         not: new NotTagFilter(),
         content: new ContentFilter()
      };
   }

   get api() {
      return this._api;
   }

   set api(value: BookmarkApi) {
      if (this._api) {
         this._api.retrieveEvent.unsubscribe(this.dataRetrievedHandler);
      }
      this._api = value;
      if (this._api) {
         this._api.retrieveEvent.subscribe(this.dataRetrievedHandler, true);
      }
   }

   private onDataRetrieved(sender: BookmarkApi, args: IRetrieveEventArgs) {
      this.fullResults = args.results;
      this.runAllFilters();
   }

   get canFilter() {
      return !!this.fullResults;
   }

   enabledFilters() {
      const allFilters = $.map(this.filters, v => v);
      return allFilters.filter(f => f.enabled);
   }

   runAllFilters() {
      this.enabledFilters()
         .filter(f => f.query !== null && f.query !== undefined)
         .forEach(f => f.filter(this.fullResults));
      this.generateFilteredResults();
   }

   /**
    *
    * @param key The filter key
    * @param q The filter term
    * @param forceEnabled applies the filter regardless of its initial enabled status
    */
   applyFilter(key: "or" | "and" | "not" | "content", q: any) {
      const filter = this.filters[key];
      filter.query = q;
      filter.filter(this.fullResults);
      this.generateFilteredResults();
   }

   private generateFilteredResults() {
      const enabledFilters = this.enabledFilters();
      if (enabledFilters.length) {
         //
         const enabledFilterMatches = enabledFilters.map(f => f.results);
         const idsThatMatchAllFilters = SetOps.reduce(
            enabledFilterMatches,
            SetOps.intersection
         );
         this.filteredResults = this.fullResults.filterIds(
            idsThatMatchAllFilters
         );
      } else if (this.settings.mode === FilterMode.Filter) {
         this.filteredResults = this.fullResults;
      } else {
         this.filteredResults = new Bookmarks({});
      }

      new WhitelistPopulator(this).populate();
      this.resultsChangedEvent.trigger();
   }
}

/**
 * Sets the allowed and disallowed options for each tag filter.
 * This is its own class because the results depend on combined filter states.
 */
class WhitelistPopulator {
   constructor(private filterModel: FilterModel) { }

   private queriedTags: Set<string>;
   private queriedTagsArr: string[];
   private allTagsExceptQueried: string[];
   private relatedTagsExceptQueried: string[];

   populate() {
      this.queriedTags = this.findQueriedTags();
      this.queriedTagsArr = [...this.queriedTags];

      this.allTagsExceptQueried = [
         ...SetOps.difference(
            new Set(this.filterModel.fullResults.tagList),
            this.queriedTags
         )
      ];

      this.relatedTagsExceptQueried = [
         ...SetOps.difference(
            new Set(this.filterModel.filteredResults.tagList),
            this.queriedTags
         )
      ];

      this.setAndFilter();
      this.setOrFilter();
      this.setNotFilter();
   }

   private findQueriedTags() {
      const filters = this.filterModel.filters;
      let tagFilters = [filters.and, filters.or, filters.not];
      tagFilters = tagFilters.filter(f => f.enabled);
      const tags = <Set<string>[]>tagFilters.map(f => new Set(f.query));
      return SetOps.reduce(tags, SetOps.union);
   }

   private setAndFilter() {
      const filter = this.filterModel.filters.and;
      filter.whitelist = this.relatedTagsExceptQueried;
      filter.blacklist = this.queriedTagsArr;
   }

   private setOrFilter() {
      const filter = this.filterModel.filters.or;
      const idsMatchingEachFilter = this.filterModel
         .enabledFilters()
         .filter(f => f.key !== "or")
         .map(f => f.results);

      if (idsMatchingEachFilter.length) {
         const idsMatchingAllOtherFilters = SetOps.reduce(
            idsMatchingEachFilter,
            SetOps.intersection
         );

         filter.whitelist = [
            ...SetOps.difference(
               this.filterModel.fullResults.tagsByIds(
                  idsMatchingAllOtherFilters
               ),
               this.queriedTags
            )
         ];
      } else {
         filter.whitelist = this.allTagsExceptQueried;
      }

      filter.blacklist = this.queriedTagsArr;
   }

   private setNotFilter() {
      const filter = this.filterModel.filters.not;
      filter.whitelist = this.relatedTagsExceptQueried;
      filter.blacklist = this.queriedTagsArr;
   }
}

/**
 * Determines behavior in the case of an empty search term
 */
export enum FilterMode {
   /** Display all results upon empty query. */
   Filter,
   /** Display no results upon empty query. */
   Search
}

export interface IFilter {
   filter(fullResults: Bookmarks): Set<string>;
   results: Set<string>;
   mode: FilterMode;
}

abstract class Filter<TQuery> implements IFilter {
   public query: TQuery;
   protected dirty = false;
   public mode = FilterMode.Filter;
   public results: Set<string>;

   constructor(public key: string) { }

   private equals<T>(a: T, b: T) {
      if (a === b) {
         return true;
      }
      if (Array.isArray(a) && Array.isArray(b)) {
         if (a.length !== b.length) {
            return false;
         }
         for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) {
               return false;
            }
         }
         return true;
      }
      return false;
   }

   /**
    * Returns matching item ids for an enabled filter with an empty query.
    * @param fullResults
    */
   protected emptyQueryResultSet(fullResults: Bookmarks): Set<string> {
      return this.mode === FilterMode.Filter
         ? new Set(fullResults.links.map(i => i.item_id))
         : new Set();
   }

   get enabled() {
      return this.query && (!Array.isArray(this.query) || this.query.length);
   }

   disable() {
      this.query = null;
   }

   private lastQuery: TQuery = null;
   private lastFilter: Bookmarks = null;

   /**
    * Filters results and returns matching item ids
    * @param q The search term.
    * @param fullResults The full results to filter.
    */
   filter(fullResults: Bookmarks) {
      if (
         !this.equals(this.lastQuery, this.query) ||
         this.lastFilter !== fullResults
      ) {
         this.results = this._filter(fullResults);
         this.lastQuery = this.query;
         this.lastFilter = fullResults;
      }
      return this.results;
   }

   protected _filter(fullResults: Bookmarks) {
      return new Set<string>();
   }
}

export abstract class TagFilter extends Filter<string[]> {
   public whitelist: string[] = [];
   public blacklist: string[] = [];

   /**
    *
    * @param key The key to identify the filter.
    * @param combiner Given the full results and a set of item ids for each tag, combine them to one list of all matching items.
    */
   constructor(
      key: string,
      private combiner: (
         itemsByTag: Set<ILinkData>[],
         fullResults: Bookmarks
      ) => Set<ILinkData>
   ) {
      super(key);
   }

   protected _filter(fullResults: Bookmarks): Set<string> {
      if (!this.query.length) {
         return this.emptyQueryResultSet(fullResults);
      }
      const itemsByTags = this.query.map(t => fullResults.linksByTag(t));
      const matchingItems = this.combiner(itemsByTags, fullResults);
      const matchingItemIds = SetOps.map(matchingItems, m => m.item_id);
      return matchingItemIds;
   }
}

class AndTagFilter extends TagFilter {
   constructor() {
      super("and", items => SetOps.reduce(items, SetOps.intersection));
   }

   protected _filter(fullResults: Bookmarks): Set<string> {
      const filteredIds = super._filter(fullResults);

      if (this.query.length !== 1 || filteredIds.size) {
         return filteredIds;
      }

      // if one "tag" was specified, also search content as a convenience
      const contentFilter = new ContentFilter();
      contentFilter.query = this.query[0];
      return contentFilter._filter(fullResults);
   }
}

class OrTagFilter extends TagFilter {
   constructor() {
      super("or", items => SetOps.reduce(items, SetOps.union));
   }
}

class NotTagFilter extends TagFilter {
   constructor() {
      super("not", (items, fullResults) => {
         const allItems = new Set(fullResults.links);
         const excludedItems = SetOps.reduce(items, SetOps.union);
         return SetOps.difference(allItems, excludedItems);
      });
   }
}

class ContentFilter extends Filter<string> {
   constructor() {
      super("content");
   }

   private getFieldQuery(search: string) {
      search = search.normalize().toUpperCase();
      let fields = [
         "excerpt",
         "given_title",
         "resolved_title",
         "resolved_url",
         "authors"
      ];

      const subFields = this.getSubFields(fields);
      const subFieldList = Object.keys(subFields).join("|");
      const subFieldReg = RegExp(`^(${subFieldList}):\\s*(.+?)\\s*$`, "g");
      eif(subFieldReg.exec(search), m => {
         search = m[2];
         fields = (<any>subFields)[m[1]];
      });

      return { search, fields };
   }

   private getSubFields(fullList: string[]) {
      return {
         URL: ["resolved_url"],
         TITLE: ["given_title", "resolved_title"],
         CONTENT: ["resolved_title", "given_title", "excerpt"],
         AUTHOR: ["authors"],
         ALL: fullList
      };
   }

   _filter(fullResults: Bookmarks) {
      const { search, fields } = this.getFieldQuery(this.query);

      if (!search) {
         return this.emptyQueryResultSet(fullResults);
      }

      const matchesLink = (link: ILinkData) =>
         fields.some(f => matchesField(link[f]));
      const matchesField = (v: any) =>
         ((v || "") + "").toUpperCase().indexOf(search) > -1;

      var matchingItems = fullResults.links.filter(matchesLink);
      const matchingItemIds = matchingItems.map(item => item.item_id);
      return new Set(matchingItemIds);
   }
}
