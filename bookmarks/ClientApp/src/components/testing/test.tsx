import React, {useState} from 'react';
import {
    ActionPanel,
    ActionPanelChildProps,
    ActionPanelProps,
    SubmitHandler
} from "../import/ActionPanel";
import {BookmarkSourceType, SourcedBookmarks, SourceTrustLevel} from "../../redux/bookmarks/reducer";

export type ImportSubmitHandler = SubmitHandler<SourcedBookmarks>;
type ImportPanelChildProps = ActionPanelChildProps<SourcedBookmarks>;
type ImportPanelProps<C extends ImportPanelChildProps> = ActionPanelProps<SourcedBookmarks, C>;
export function TestActionPanel<C extends ImportPanelChildProps>({
     children,
     ...rest
 }: ImportPanelProps<C>) {
    const setBookmarks = (result: Promise<SourcedBookmarks>) => {
        result.then(({bookmarks, source}) => {
            alert(source.description);
        })
    }

    return (
       <ActionPanel {...rest}  onSubmitted={setBookmarks} >
           {children}
       </ActionPanel>
    );
}


type InnerProps = ImportPanelChildProps & {
   label: string;
}
function Inner({label, setHandler}: InnerProps) {
    const [name, setName] = useState("");
    
    function changeName(newName: string) {
        setName(newName);
        if(!setHandler) {
           return;
        }
        
        if(!newName) {
           setHandler(false);
           return;
        }
        
        const result: SourcedBookmarks = {
            bookmarks: {},
            source: {
                description: newName,
                type: BookmarkSourceType.externalJson,
                trusted: SourceTrustLevel.trusted
            }
        };
        
        setHandler(() => Promise.resolve(result));   
    }

    return <div>
       <h2>{label}</h2>
        <input type="text" value={name} onChange={e => changeName(e.target.value)}/>
    </div>;
}

export type TestContainerProps = {
};
export const TestContainer: React.FC<TestContainerProps> = ({}) => {
    return (
       <TestActionPanel header="Test Form">
          <Inner label={"Enter text here:"} />
       </TestActionPanel>
    );
};

export default TestContainer;
