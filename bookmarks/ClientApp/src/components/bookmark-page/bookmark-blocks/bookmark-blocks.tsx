/** @flow */
import React, { useRef, useState } from 'react';
import { AppState, MyThunkDispatch } from '../../../redux/root/reducer';
import { StoreDispatch } from '../../../redux/store/configureStore';
import { connect } from 'react-redux';
import { Masonry, CellMeasurerCache, WindowScroller, CellMeasurer, MasonryCellProps, AutoSizer, List, ListRowRenderer, Collection, Size } from 'react-virtualized';
import { CellRenderer, createCellPositioner, Positioner } from 'react-virtualized/dist/es/Masonry';
import { selectors } from '../../../redux/bookmarks/reducer';

import BookmarkBlock from '../bookmark-block/bookmark-block';
import { useEffect } from 'react';
import pocketReducer, { selectors as pocketSelectors } from '../../../redux/pocket/reducer';
import { selectors as rootSelectors } from '../../../redux/selectors';
import { actionCreators } from '../../../redux/pocket/bookmarks/actions';
import { CellPosition } from 'react-virtualized/dist/es/CellMeasurer';

interface BookmarkBlocksState {
    //columnWidth: number,
    //height: number,
    //gutterSize: number,
    //overscanByPixels: number,
    //windowScrollerEnabled: boolean,

    columnWidth: number,
    height: number,
    gutterSize: number,
    overscanByPixels: number,
    windowScrollerEnabled: boolean,
}

class BookmarkBlocksComponent extends React.PureComponent<BookmarkBlocksProps, BookmarkBlocksState> {
    private columnCount: number = 0;
    private readonly cache: CellMeasurerCache;
    private width: number = 0;

    constructor(props: BookmarkBlocksProps) {
        super(props);

        this.cache = new CellMeasurerCache({
            defaultHeight: 250,
            defaultWidth: 300,
            fixedWidth: true,
        });

        this.state = {
            columnWidth: 300,
            height: 500,
            gutterSize: 10,
            overscanByPixels: 200,
            windowScrollerEnabled: true,
        };

        this.cellRenderer = this.cellRenderer.bind(this);
        this.onResize = this.onResize.bind(this);
        this.renderAutoSizer = this.renderAutoSizer.bind(this);
        this.renderMasonry = this.renderMasonry.bind(this);
        this.setMasonryRef = this.setMasonryRef.bind(this);
    }

    componentDidMount() {
        if (this.props.bookmarkIds.length === 0) {
            this.props.fetchBookmarks();
        }
    }

    componentDidUpdate(prevProps: BookmarkBlocksProps, prevState: BookmarkBlocksState) {
        if (prevProps.bookmarkIds !== this.props.bookmarkIds && this.masonry) {
            console.log("componentDidUpdate");
            this._resetList();
            if (this.autosizer) {
                this.autosizer.forceUpdate();
            }
        }
    }

    render() {
        const {
            columnWidth,
            height,
            gutterSize,
            overscanByPixels,
            windowScrollerEnabled,
        } = this.state;

        let child;

        console.log("render", this.state, this.props.bookmarkIds);

        if (windowScrollerEnabled) {
            child = (
                <WindowScroller overscanByPixels={overscanByPixels}>
                    {this.renderAutoSizer}
                </WindowScroller>
            );
        } else {
            child = this.renderAutoSizer({ height });
        }

        return child;
    }

    calculateColumnCount() {
        const { columnWidth, gutterSize } = this.state;

        this.columnCount = Math.floor(this.width / (columnWidth + gutterSize));
    }

    cellRenderer({ index, key, parent, style }: MasonryCellProps): ReturnType<CellRenderer> {
        const { columnWidth } = this.state;
        const { bookmarkIds } = this.props;

        return (
            <CellMeasurer cache={this.cache} index={index} key={key} parent={parent}>
                <div style={style}>
                    <BookmarkBlock width={columnWidth} id={bookmarkIds[index]} />
                </div>
            </CellMeasurer>
        );
    }

    private cellPositioner: Positioner | null = null;

    initCellPositioner() {
        if (!this.cellPositioner) {
            const { columnWidth, gutterSize } = this.state;

            this.cellPositioner = createCellPositioner({
                cellMeasurerCache: this.cache,
                columnCount: this.columnCount,
                columnWidth,
                spacer: gutterSize,
            });
        }
    }

    onResize({ width }: Size) {
        this.width = width;

        this.calculateColumnCount();
        this.resetCellPositioner();
        if (this.masonry) {
            this.masonry.recomputeCellPositions();
        }
    }

    private height: number = 0;
    private scrollTop: number | undefined = undefined;
    private autosizer: AutoSizer | null = null;
    renderAutoSizer({ height, scrollTop }: { height: number, scrollTop?: number }) {
        this.height = height;
        this.scrollTop = scrollTop;

        const { overscanByPixels } = this.state;

        return (
            <AutoSizer
                disableHeight
                height={height}
                onResize={this.onResize}
                overscanByPixels={overscanByPixels}
                ref={r => this.autosizer = r}
                scrollTop={this.scrollTop}>

                {this.renderMasonry}

            </AutoSizer>
        );
    }

    renderMasonry({ width }: { width: number }) {
        this.width = width;

        this.calculateColumnCount();
        this.initCellPositioner();

        const { height, overscanByPixels, windowScrollerEnabled } = this.state;

        if (this.cellPositioner === null) {
            throw Error("Cell positioner not available.");
        }

        return (
            <Masonry
                autoHeight={windowScrollerEnabled}
                cellCount={this.props.bookmarkIds.length}
                cellMeasurerCache={this.cache}
                cellPositioner={this.cellPositioner}
                cellRenderer={this.cellRenderer}
                height={windowScrollerEnabled ? this.height : height}
                overscanByPixels={overscanByPixels}
                ref={this.setMasonryRef}
                scrollTop={this.scrollTop}
                width={width}
            />
        );
    }

    // This is a bit of a hack to simulate newly loaded cells
    _resetList = () => {
        //const ROW_HEIGHTS = [25, 50, 75, 100];

        //const { list } = this.context;
        //list.forEach(datum => {
        //    datum.size = ROW_HEIGHTS[Math.floor(Math.random() * ROW_HEIGHTS.length)];
        //});

        this.cache.clearAll();
        this.resetCellPositioner();
        if (this.masonry) {
            this.masonry.clearCellPositions();
        }
    };

    resetCellPositioner() {
        const { columnWidth, gutterSize } = this.state;

        if (this.cellPositioner) {
            this.cellPositioner.reset({
                columnCount: this.columnCount,
                columnWidth,
                spacer: gutterSize,
            });
        }
    }

    private masonry: Masonry | null = null;
    setMasonryRef(ref: Masonry) {
        this.masonry = ref;
    }
}

interface BookmarkBlocksProps extends StateProps, DispatchProps {
    columnWidth?: number;
}

const mapStateToProps = (state: AppState) => {
    return {
        bookmarkIds: selectors.selectSortedBookmarkIds(state),
        loading: pocketSelectors.bookmarks(state),
    };
};
type StateProps = ReturnType<typeof mapStateToProps>;

const mapDispatchToProps = (dispatch: StoreDispatch) => ({
    fetchBookmarks: () => dispatch(actionCreators.fetchBookmarks())
});
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

export const connectedBookmarkPage = connect(mapStateToProps, mapDispatchToProps)(BookmarkBlocksComponent);

export default connectedBookmarkPage;