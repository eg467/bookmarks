import * as React from "react";
import {createStyles, makeStyles, Theme} from "@material-ui/core";
import {green} from "@material-ui/core/colors";
import {CSSProperties, useState, useRef} from "react";
import clsx from "clsx";

export type FileContents = {
   name: string;
   contents: string;
};

export type StyleProps = {
   width?: string|number;
   height?: string|number;
}

export type FileUploadProps = StyleProps & {
   onUpload?: (file: Promise<FileContents>) => void;
   /**
    * Defaults to UTF-8
    */
   fileEncoding?: string;
   targetLabel?: React.ReactNode;
};


const useStyles = makeStyles((theme: Theme) =>
   createStyles({
      container: ({width, height}: StyleProps) => ({
         height: height || "unset",
         width: width || "100%",
         padding: theme.spacing(4),
         borderColor: green[300],
         borderRadius: 3,
         boxSizing: "border-box",
         borderStyle: "dashed",
         backgroundColor: green[50],
         "&.file-hover": {
            borderColor: green[900],
            backgroundColor: green[200],   
         },
         "& h3": {
            textAlign: "center",
         }
      })
   }));

export const FileUpload: React.FC<FileUploadProps> = ({
   fileEncoding,
   onUpload,
   targetLabel = <p>Drag a file here.</p>,
   ...styleProps
}) => {
   const classes = useStyles(styleProps);
   const fileRef = useRef<HTMLInputElement | null>(null);
   // To keep class styling when dragging over child elements.
   const dragCounter = useRef(0);
   const [fileHover, setFileHover] = useState(false);
   
   const readFile = (files: FileList) => 
      new Promise<FileContents>((res, rej) => {
         if (!files) {
            rej(Error("No file input reference."));
            return;
         }
         if (files.length !== 1) {
            rej(Error("You must select exactly one file."));
            return;
         }

         const file = files[0];

         const reader = new FileReader();
         reader.onload = (evt) => {
            if (evt.target) {
               res({
                  name: file.name,
                  contents: String(evt.target.result)
               });
            } else {
               rej(Error("Error reading file."));
            }
         };
         reader.onerror = (evt) => {
            rej(Error(
               (evt.target && evt.target.error && evt.target.error.name)
               || "Error reading File"
            ));
         };
         reader.readAsText(file, fileEncoding);
      });
   
   
   const handleUpload = () => {
      if(onUpload && fileRef.current && fileRef.current.files) {
         const read = readFile(fileRef.current.files);
         onUpload(read);   
      }
   };

   const dragenter = (e: React.DragEvent<HTMLElement>) => {
      setFileHover(true);
      dragCounter.current = dragCounter.current + 1; 
      e.stopPropagation();
      e.preventDefault();
   }

   
   const dragover = (e: React.DragEvent<HTMLElement>) => {
      e.stopPropagation();
      e.preventDefault();
   }

   const dragLeave = (e: React.DragEvent<HTMLElement>) => {
      // https://stackoverflow.com/questions/7110353/html5-dragleave-fired-when-hovering-a-child-element/21002544#21002544
      dragCounter.current = dragCounter.current - 1;
      if(dragCounter.current === 0) {
         setFileHover(false);
      }
      e.stopPropagation();
      e.preventDefault();
   }

   const drop = (e: React.DragEvent<HTMLElement>) => {
      setFileHover(false);
      e.stopPropagation();
      e.preventDefault();
      const dt = e.dataTransfer;
      const read = readFile(dt.files);
      if(onUpload) {
         onUpload(read);
      }
   }
   
   const className = clsx(classes.container, {"file-hover": fileHover});
   return (
      <div className={className} onDragEnter={dragenter} onDragOver={dragover} onDragLeave={dragLeave} onDrop={drop}>
         <h3>Drag and drop an exported bookmark HTML file here</h3>
         <input type="file" ref={fileRef} onChange={handleUpload} />
      </div>   
   ); 
};

export default FileUpload;
