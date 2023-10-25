import React, { useRef, useEffect } from "react";
// quill modules
import Quill from "quill";
import "quill-emoji";
import Focus from "quill-focus/src/focus";
import QuillCursors from "quill-cursors";
import "quill-emoji/dist/quill-emoji.css";
import "react-quill/dist/quill.snow.css";
import "quill-focus/src/focus.css";
// yjs connection
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { QuillBinding } from "y-quill";

let quillInstance = null;

const Editor = () => {
  const quillRef = useRef(null);
  Quill.register("modules/focus", Focus);
  Quill.register("modules/cursors", QuillCursors);

  useEffect(() => {
    if (!quillInstance && quillRef.current) {
      quillInstance = new Quill(quillRef.current, {
        theme: "snow",
        modules: {
          focus: {
            focusClass: "focused-blot", // Defaults to .focused-blot.
          },
          cursors: true,
          toolbar: {
            container: [
              ["bold", "italic", "underline", "strike"],
              ["blockquote", "code-block"],
              [{ list: "ordered" }, { list: "bullet" }],
              ["link", "image"],
              [{ align: [] }],
              ["emoji"],
              ["clean"],
            ],
          },
          "emoji-toolbar": true,
          "emoji-textarea": false,
          "emoji-shortname": true,
        },
      });
    }
  }, []);

  useEffect(() => {
    if (quillInstance) {
      const ydoc = new Y.Doc();
      const provider = new WebrtcProvider("collab_text_room", ydoc);
      const ytext = ydoc.getText("quill");

      new QuillBinding(ytext, quillInstance, provider.awareness);
    }
  }, []);

  return (
    <>
      <div ref={quillRef} />
    </>
  );
};

export default Editor;
