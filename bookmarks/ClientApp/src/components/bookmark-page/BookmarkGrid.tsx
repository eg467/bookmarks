import * as React from 'react';
import {useRef, Fragment} from 'react';
import clsx from "clsx";
import {AutoSizer, Grid, GridCellRenderer, WindowScroller} from "react-virtualized";
import {useStoreSelector} from "../../redux/store/configureStore";
import {selectors} from "../../redux/bookmarks/reducer";
import {BookmarkDisplayElements, selectors as optionSelectors} from "../../redux/options/reducer";
import SelectBookmark from "./SelectBookmark";
import {BookmarkLink} from "./BookmarkLink";
import BookmarkTagEditor from "../tags/BookmarkTagEditor";
import {BookmarkActions} from "./BookmarkActionFab";
import {BookmarkFaviconById} from "../images/Favicon";
import {createStyles, makeStyles} from "@material-ui/core";
import {Theme} from "@material-ui/core/styles";
import {grey} from "@material-ui/core/colors";
import BookmarkDescription from "./BookmarkDescription";
import {DomainLabel} from "./DomainLabel";


const useStyles = makeStyles((theme: Theme) =>
   createStyles({
      media: {
         height: 0,
         paddingTop: "56.25%", // 16:9,
         marginTop: "30",
         backgroundSize: "contain",
         backgroundPosition: "center center",
      },
      evenRow: {
         backgroundColor: theme.palette.background.paper,
      },
      oddRow: {
         backgroundColor: grey["200"],
      },
      cell: {
         display: "flex", 
         alignItems: "center",
         padding: 5,
      },
      windowScrollerWrapper: {
         flex: "1 1 auto",
      },
      actionContainer: {
         display: "flex",
         "&>*": {
            margin: theme.spacing(1)
         }
      },
      favicon: {
         display: "block"
      }
   }),
);



export type BookmarkGridProps = {
   overscanColumnCount?: number,
   overscanRowCount?: number,
   rowHeight?: number,
   scrollToColumn?: number,
   scrollToRow?: number,
   useDynamicRowHeight?: boolean,
};

export type BookmarkGridState = {

};

type AutosizerState = {
   width: number;
   height: number,
   scrollTop?: number;
   autosizer: Nullable<AutoSizer>;
}

type bookmarkColumn = {
   width: number;
   render: (id: string) => React.ReactNode;
   show: boolean;
}

export const BookmarkGrid: React.FC<BookmarkGridProps> = ({
   overscanColumnCount = 0,
   overscanRowCount = 10,
   rowHeight = 60,
   scrollToColumn = undefined,
   scrollToRow = undefined,
   
}) => {
   const bookmarkIds = useStoreSelector(selectors.selectSortedBookmarkIds);
   const shouldShow = useStoreSelector(optionSelectors.selectDisplayElementQuery);
   // This might be unnecessary
   const autosizerState = useRef<AutosizerState>({
      autosizer:null, 
      height:0,
      width: 0,
   })
   const classes =  useStyles();
   
   const visibleColumns: bookmarkColumn[] = [
      {
         width: 50,
         render: (id: string) => <SelectBookmark bookmarkId={id}/>,
         show: true
      },
      {
         width: 50,
         render: (id: string) => <BookmarkFaviconById className={classes.favicon} bookmarkId={id} />,
         show: shouldShow(BookmarkDisplayElements.favicon)
      },
      {
         width: 300,
         render: (id: string) => (
            <BookmarkLink bookmarkId={id}/>
         ),
         show: true
      },
      {
         width: 300,
         render: (id: string) => <BookmarkDescription bookmarkId={id} />,
         show: shouldShow(BookmarkDisplayElements.description)
      },
      {
         width: 300,
         render: (id: string) => <BookmarkTagEditor bookmarkId={id} />,
         show: shouldShow(BookmarkDisplayElements.tags)
      },
      {
         width: 300,
         render: (id: string) => (
            <div className={classes.actionContainer}>
               <BookmarkActions bookmarkId={id}/>
            </div>
         ),
         show: shouldShow(BookmarkDisplayElements.edit)
      },
   ].filter(c => c.show);
   
   
   const getRowClassName = (row: number) =>
      row % 2 === 0 ? classes.evenRow : classes.oddRow;
   
   
   const renderBodyCell: GridCellRenderer = ({columnIndex, key, rowIndex, style})  => {
      const id = bookmarkIds[rowIndex];
      const className = clsx(getRowClassName(rowIndex), classes.cell);
      return (
         <div key={key} className={className} style={style}>
            {visibleColumns[columnIndex].render(id)}
         </div>
      );
   }
   
   const getColumnWidth = ({index}: {index: number}) => visibleColumns[index].width;
   const noContentRenderer = () => <div>No cells</div>;


   //
   // const onResize = ({ width }: Size) => {
   //    autosizerState.current.width = width;
   // }
   //
   //
   //
   // const renderGrid = (size: Size) => {
   //    const {width, height} = size;
   //    console.log(height);
   //    return (
   //       <Grid
   //          cellRenderer={renderBodyCell}
   //          //className={styles.BodyGrid}
   //          columnWidth={getColumnWidth}
   //          autoHeight
   //          columnCount={columnCount}
   //          height={height}
   //          noContentRenderer={noContentRenderer}
   //          overscanColumnCount={overscanColumnCount}
   //          overscanRowCount={overscanRowCount}
   //          rowHeight={rowHeight}
   //          rowCount={bookmarkIds.length}
   //          scrollToColumn={scrollToColumn}
   //          scrollToRow={scrollToRow}
   //          width={width}
   //       />
   //    );
   // };
   //
   // const renderAutoSizer = ({ height, scrollTop }: { height: number, scrollTop?: number }) => {
   //    console.log(`renderAutoSizer: height: ${height}.`)
   //    autosizerState.current.height = height;
   //    autosizerState.current.scrollTop = scrollTop;
   //    return (
   //       <AutoSizer
   //          disableHeight
   //          height={height}
   //          //onResize={this.onResize}
   //          overscanByPixels={600}
   //          ref={r => autosizerState.current.autosizer = r}
   //          scrollTop={scrollTop}
   //       >
   //          {
   //             ({width, height}) => {
   //                return renderGrid({width, height}); 
   //             }
   //          }
   //       </AutoSizer>
   //    );
   // }

   const overscanByPixels = 500;
   return (
      <WindowScroller overscanByPixels={overscanByPixels}>
         {
            ({height, isScrolling, registerChild, onChildScroll, scrollTop}) => (
               <div className={classes.windowScrollerWrapper}>
                  <AutoSizer
                     disableHeight
                     height={height}
                     overscanByPixels={overscanByPixels}
                     scrollTop={scrollTop}
                  >
                     {({width}) => (
                        <div ref={registerChild}>
                           <Grid
                              cellRenderer={renderBodyCell}
                              //className={styles.BodyGrid}
                              columnWidth={getColumnWidth}
                              autoHeight
                              columnCount={visibleColumns.length}
                              height={height}
                              isScrolling={isScrolling}
                              scrollTop={scrollTop}
                              onScroll={onChildScroll}
                              noContentRenderer={noContentRenderer}
                              overscanColumnCount={overscanColumnCount}
                              overscanRowCount={overscanRowCount}
                              rowHeight={rowHeight}
                              rowCount={bookmarkIds.length}
                              scrollToColumn={scrollToColumn}
                              scrollToRow={scrollToRow}
                              width={width}
                           />
                        </div>
                     )}
                  </AutoSizer>
               </div>
            )
         }
      </WindowScroller>
   );
}
