import React, { } from 'react';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import * as virt from 'react-virtualized';
import { CellMeasurerCache, WindowScroller, CellMeasurer, AutoSizer } from 'react-virtualized';
import { createCellPositioner } from 'react-virtualized/dist/es/Masonry';
import Card from '@material-ui/core/Card';

/*
interface CreatableMultiProps {
   options: any[];
}

export class CreatableMulti extends Component<CreatableMultiProps> {
   state = { lastSelected: [] };

   handleChange = (newValue: any, actionMeta: any) => {
      console.group('Value Changed');
      console.log(newValue);
      console.log(actionMeta);
      console.groupEnd();

      this.setState({ lastSelected: newValue });
   };

   render() {
      return (
         <Fragment>
            <div>Last Selected: {JSON.stringify(this.state.lastSelected)}</div>
            <CreatableSelect
               isMulti
               onChange={this.handleChange}
               options={this.props.options}
            />
         </Fragment>
      );
   }
}

interface TagFiltersProps {
}

export class TagFilters extends Component<TagFiltersProps> {
   private characters = [
      "Homer", "Marge", "Bart", "Lisa", "Maggie"
   ].map(c => ({ value: c, label: c }));

   state = {
      and: [...this.characters],
      or: [...this.characters],
      not: [...this.characters],
   };

   constructor(props: TagFiltersProps) {
      super(props);
      this.handleChange = this.handleChange.bind(this);
   }

   handleChange(newValue: ValueType<{}>, actionMeta: ActionMeta) {
      console.group('Value Changed');
      console.log(newValue);
      console.log(actionMeta);
      console.groupEnd();

      this.setState({ lastSelected: newValue });
   }

   render() {
      return (
         <Fragment>
            <h2>Tags</h2>
            <label>
               Include <em>all</em> of these tags:
                  <CreatableSelect
                  isMulti
                  name="and"
                  onChange={this.handleChange}
                  options={this.state.and}
               />
            </label>
            <label>
            Include <em>at least one</em> of these tags:
            <CreatableSelect
               isMulti
               name="or"
               onChange={this.handleChange}
               options={this.state.or}
            />
</label>
<label>
            Include <em>None</em> of these tags

            <CreatableSelect
               isMulti
               name="or"
               onChange={this.handleChange}
               options={this.state.not}
            />
       </label>
         </Fragment >
      );
   }
}

export default function (props: any) {
   const [characters, setCharacters] = useState([
      "Homer", "Marge", "Bart", "Lisa", "Maggie"
   ].map(c => ({ value: c, label: c })));

   function handleAddOption() {
      const name = `Character #${characters.length + 1}`;
      setCharacters([...characters, { value: name, label: name }]);
   }

   return (
      <div>
         <h1>Testing</h1>

         <TagFilters />

         <button onClick={handleAddOption}>Add Option</button>
         <CreatableMulti options={characters} />

      </div>
   );
}
*/

export const SampleCard = ({ style }: any) => {
    return (
        <Card style={style}>
            <CardContent>
                <Typography color="textSecondary" gutterBottom>
                    Link
        </Typography>
                <Typography variant="h5" component="h2">
                    Title
        </Typography>
                <Typography variant="body2" component="p">
                    This is an excerpt.
        </Typography>
            </CardContent>
            <CardActions>
                <Button size="small">Learn More</Button>
            </CardActions>
        </Card>
    );
};

export default class GridExample extends React.PureComponent {
    private _columnCount: number;
    private _cache: CellMeasurerCache;
    private _cellPositioner: any; //virt.Positioner;
    private _width = 400;
    private _height: number = 0;
    private _scrollTop: number = 0;
    private _masonry: any; //virt.Masonry;

    public state: {
        columnWidth: number,
        height: number,
        gutterSize: number,
        overscanByPixels: number,
        windowScrollerEnabled: boolean,
    };

    constructor(props: any) {
        super(props);

        this._columnCount = 0;

        this._cache = new CellMeasurerCache({
            defaultHeight: 250,
            defaultWidth: 200,
            fixedWidth: true,
        });

        this.state = {
            columnWidth: 400,
            height: 800,
            gutterSize: 10,
            overscanByPixels: 0,
            windowScrollerEnabled: true,
        };

        this._cellRenderer = this._cellRenderer.bind(this);
        this._onResize = this._onResize.bind(this);
        this._renderAutoSizer = this._renderAutoSizer.bind(this);
        this._renderMasonry = this._renderMasonry.bind(this);
        this._setMasonryRef = this._setMasonryRef.bind(this);
    }

    render() {
        const {
            height,
            overscanByPixels,
            windowScrollerEnabled,
        } = this.state;

        if (windowScrollerEnabled) {
            return (
                <WindowScroller overscanByPixels={overscanByPixels}>
                    {this._renderAutoSizer}
                </WindowScroller>
            );
        } else {
            return (
                <div>
                    {this._renderAutoSizer({ height, scrollTop: 0 })}
                </div>
            );
        }
    }

    _calculateColumnCount() {
        const { columnWidth, gutterSize } = this.state;

        this._columnCount = Math.floor(this._width / (columnWidth + gutterSize));
    }

    private _list = [...Array(500)].map(_ => ({
        height: Math.round(150 + Math.random() * 300)
    }));

    _cellRenderer({ index, key, parent, style }: any) {
        const { columnWidth } = this.state;

        const datum = this._list[index];

        console.log(datum);

        return (
            <CellMeasurer cache={this._cache} index={index} key={key} parent={parent}>
                <div
                    // className={styles.Cell}
                    style={{
                        ...style,
                        width: columnWidth,
                    }}>

                    <SampleCard style={{ height: datum.height }} />

                    {/* <div
                  style={{
                     backgroundColor: "blue",
                     borderRadius: '0.5rem',
                     height: datum.height,
                     marginBottom: '0.5rem',
                     width: '100%',
                     fontSize: 20,
                     color: 'white',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                  }}>
                  {index}
               </div>

               This is some text. */}
                </div>
            </CellMeasurer>
        );
    }

    _initCellPositioner() {
        if (typeof this._cellPositioner === 'undefined') {
            const { columnWidth, gutterSize } = this.state;

            this._cellPositioner = createCellPositioner({
                cellMeasurerCache: this._cache,
                columnCount: this._columnCount,
                columnWidth,
                spacer: gutterSize,
            });
        }
    }

    _onResize({ width }: { width: number }) {
        this._width = width;

        this._calculateColumnCount();
        this._resetCellPositioner();
        this._masonry.recomputeCellPositions();
    }

    _renderAutoSizer({ height, scrollTop }: { height: number, scrollTop: number }) {
        this._height = height;
        this._scrollTop = scrollTop;

        const { overscanByPixels } = this.state;

        return (
            <AutoSizer
                disableHeight
                height={height}
                onResize={this._onResize}
                overscanByPixels={overscanByPixels}
                scrollTop={this._scrollTop}>
                {this._renderMasonry}
            </AutoSizer>
        );
    }

    _renderMasonry({ width }: { width: number }) {
        this._width = width;

        this._calculateColumnCount();
        this._initCellPositioner();

        const { height, overscanByPixels, windowScrollerEnabled } = this.state;

        return (
            <virt.Masonry
                autoHeight={windowScrollerEnabled}
                cellCount={this._list.length}
                cellMeasurerCache={this._cache}
                cellPositioner={this._cellPositioner}
                cellRenderer={this._cellRenderer}
                height={windowScrollerEnabled ? this._height : height}
                overscanByPixels={overscanByPixels}
                ref={this._setMasonryRef}
                scrollTop={this._scrollTop}
                width={width}
            />
        );
    }

    _resetCellPositioner() {
        const { columnWidth, gutterSize } = this.state;

        this._cellPositioner.reset({
            columnCount: this._columnCount,
            columnWidth,
            spacer: gutterSize,
        });
    }

    _setMasonryRef(ref: virt.Masonry) {
        this._masonry = ref;
    }
}