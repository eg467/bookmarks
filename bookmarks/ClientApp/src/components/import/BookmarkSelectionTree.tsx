import {BrowserBookmarkTree, treeIterator} from "../../api/BrowserBookmarkConverter";
import {useEffect, useMemo, useState} from "react";
import {BookmarkCollection, BookmarkData} from "../../redux/bookmarks/bookmarks";
import Checkbox from "@material-ui/core/Checkbox";
import {TreeItem, TreeView} from "@material-ui/lab";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import * as React from "react";
import produce from "immer";

type BookmarkSelectionTreeProps= {
   root: BrowserBookmarkTree;
   onSelectionChange?: (selections: BookmarkCollection) => void;
   filter?: string;
}
export function BookmarkSelectionTree({root,onSelectionChange,filter=""}: BookmarkSelectionTreeProps) {
   const [bookmarkSelections, setBookmarkSelections] = useState<BookmarkCollection>({} /*initialBookmarkSelections*/)

   const [visibleDirs, visibleBookmarks, totalBookmarkCount]  = useMemo(() =>{
      const visibleDirs: {[id: string]: boolean} = {};
      const visibleBookmarks: {[id: string]: boolean} = {};
      
      function markSubtreeVisible(node: BrowserBookmarkTree) {
         for(let n of treeIterator(node)) {
            visibleDirs[n.id] = true;
            n.values.forEach(b => visibleBookmarks[b.id] = true);
         }
      }

      function markParentDirsVisible(node: BrowserBookmarkTree) {
         let p: Nullable<BrowserBookmarkTree> = node;
         while(p) {
            visibleDirs[p.id] = true;
            p = p.parent;
         }
      }
      
      let bookmarkCount = 0;
      filter = filter.toLocaleUpperCase();
      const matchesFilter = (q: string) => !q || q.toLocaleUpperCase().includes(filter);
      const bookmarkMatchesFilter = (bookmark: BookmarkData) => 
         matchesFilter(bookmark.title) || matchesFilter(bookmark.url);
      
      for(let node of treeIterator(root)) {
         bookmarkCount += node.values.length;
         
         // Directory matched
         if(matchesFilter(node.label)) {
            markSubtreeVisible(node);
         }
         
         // match individual bookmarks 
         const nodesVisibleBookmarks = node.values.filter(bookmarkMatchesFilter);
         nodesVisibleBookmarks.forEach(b => visibleBookmarks[b.id] = true);
         // Provide upward node path to access individual bookmarks
         if(nodesVisibleBookmarks.length) {
            markParentDirsVisible(node);
         }
      }
      return [visibleDirs, visibleBookmarks, bookmarkCount];
   }, [filter,root]);
   
   const isVisible = (data: BookmarkData|BrowserBookmarkTree): boolean => 
      (data as BrowserBookmarkTree).children
         ? !visibleDirs || visibleDirs[data.id]
         : !visibleBookmarks || visibleBookmarks[data.id];
   
   // Changes the bookmarkSelections state and triggers callback
   const changeBookmarkSelections = (transform: (orig: BookmarkCollection) => any) => {
      setBookmarkSelections(origSelections => {
         const newSelections = produce(origSelections, draft => transform(draft));
         if(newSelections !== origSelections && onSelectionChange) {
            onSelectionChange(newSelections);
         }
         return newSelections;
      });
   }
   
   const toggleSubtree = (node: BrowserBookmarkTree, value: boolean) => {
      changeBookmarkSelections(selections => {
         for (const n of treeIterator(node)) {
            for(const b of n.values.filter(isVisible)) {
               if (value) {
                  n.values.forEach(b => selections[b.id] = b);
               } else {
                  n.values.forEach(b => delete selections[b.id]);
               }   
            }
         }
      });
   }

   const toggleBookmark = (bookmark: BookmarkData, value: boolean) => {
      changeBookmarkSelections(selections => {
         if (value) {
            selections[bookmark.id] = bookmark;
         } else {
            delete selections[bookmark.id];
         }
      });
   }

   const isNodeChecked = (node: BrowserBookmarkTree): Nullable<boolean> => {
      let selCount = 0;
      let unselCount = 0;

      for(const n of treeIterator(node)) {
         for(const b of n.values.filter(isVisible)) {
            if(bookmarkSelections[b.id]) {
               selCount++;
            } else {
               unselCount++;
            }
         }
      }

      return selCount > 0 && unselCount > 0
         ? null
         : selCount > 0 || (selCount === 0 && unselCount === 0);
   }

   // Initially select the entire tree
   useEffect(() => {
      toggleSubtree(root, true);
   }, []);

   const renderBookmarkTreeItem = (bookmark: BookmarkData) => {
      if(!isVisible(bookmark)) {
         return null;
      }
      
      const {id, url, title} = bookmark
      const checkbox = (
         <Checkbox
            color="secondary"
            checked={!!bookmarkSelections[id]}
            onChange={e => toggleBookmark(bookmark, e.target.checked) } />
      );
      const label = (
         <div style={{display: "flex", alignItems: "center"}}>
            {checkbox}
            <a target="_blank" href={url}>{title}</a>
         </div>
      );

      return (
         <TreeItem key={id} nodeId={id} label={label}/>
      );
   }

   const renderNodeTreeItem = (node: BrowserBookmarkTree) => {
      if(!isVisible(node)) {
         return null;
      }
      const checked = isNodeChecked(node);
      const checkbox = (
         <Checkbox
            color="primary"
            indeterminate={checked===null}
            checked={checked===true}
            onClick={e => {
               e.stopPropagation();
            }
            }
            onChange={e => {
               toggleSubtree(node, e.target.checked);
               //e.stopPropagation();
            }

            } />
      );

      const label = (
         <div style={{display: "flex", alignItems: "center"}}>
            {checkbox}
            <span>{node.label}</span>
         </div>
      );

      return (
         <TreeItem key={node.id} nodeId={node.id} label={label}>
            {node.children.map(renderNodeTreeItem)}
            {node.values.map(renderBookmarkTreeItem)}
         </TreeItem>
      );
   };

   return (
      <div>
         <div>
            <b>{Object.keys(bookmarkSelections).length}</b> Selected,{" "}
            <b>{Object.keys(visibleBookmarks).length}</b> Visible{" "}
            {filter &&
               <span> (containing <i>{filter}</i>){" "}</span>
            }
            {" "}of <b>{totalBookmarkCount}</b> Bookmarks
         </div>
         <TreeView
   
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpandIcon={<ChevronRightIcon />}
         >
            {renderNodeTreeItem(root)}
         </TreeView>
      </div>
   );
}

export default React.memo(BookmarkSelectionTree);