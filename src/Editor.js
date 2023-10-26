import React, { useRef, useEffect } from "react";

// quill modules
import Quill from "quill";
import "quill-emoji";
import Focus from "quill-focus/src/focus";
import QuillCursors from "quill-cursors";
import "quill-paste-smart";
import "quill-emoji/dist/quill-emoji.css";
import "react-quill/dist/quill.snow.css";
import "quill-focus/src/focus.css";
import SearchedStringBlot from "./SearchedStringBlot";
import Searcher from "./Searcher";

// yjs connection
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { QuillBinding } from "y-quill";

let quillInstance = null;
let searcher;
const Editor = () => {
  const quillRef = useRef(null);
  Quill?.register("modules/focus", Focus);
  Quill?.register("modules/cursors", QuillCursors);

  // find & replace
  Quill?.register("modules/Searcher", searcher || Searcher);
  Quill?.register(SearchedStringBlot);

  useEffect(() => {
    if (!quillInstance && quillRef?.current) {
      quillInstance = new Quill(quillRef?.current, {
        theme: "snow",
        modules: {
          Searcher: quillInstance ? true : false,
          focus: {
            focusClass: "focused-blot",
          },
          cursors: true,
          clipboard: {
            allowed: {
              tags: [
                "a",
                "b",
                "strong",
                "u",
                "s",
                "i",
                "p",
                "br",
                "ul",
                "ol",
                "li",
                "span",
              ],
              attributes: ["href", "rel", "target", "class"],
            },
            keepSelection: true,
            substituteBlockElements: true,
            magicPasteLinks: true,
            hooks: {
              uponSanitizeElement(node, data, config) {
                console?.log(node);
              },
            },
          },
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
      searcher = new Searcher(quillInstance);
    }
  }, []);

  useEffect(() => {
    if (quillInstance) {
      const ydoc = new Y.Doc();
      const provider = new WebrtcProvider("collab_text_room", ydoc);
      const ytext = ydoc.getText("quill");

      new QuillBinding(ytext, quillInstance, provider?.awareness);
    }
  }, []);

  // function for utility
  String.prototype.getIndicesOf = function (searchStr) {
    let searchStrLen = searchStr?.length;
    let startIndex = 0,
      index,
      indices = [];
    while (
      (index = this?.toLowerCase()?.indexOf(
        searchStr?.toLowerCase(),
        startIndex
      )) > -1
    ) {
      indices?.push(index);
      startIndex = index + searchStrLen;
    }
    return indices;
  };

  return (
    <>
      <div ref={quillRef} />
      <div id="search-container">
        <input
          id="search-input"
          class="input"
          type="text"
          placeholder="search"
        />
        <input
          id="replace-input"
          class="input"
          type="text"
          placeholder="replace"
        />
        <button id="search">find</button>
        <button id="replace">replace</button>
        <button id="replace-all">replace all</button>
      </div>
    </>
  );
};

export default Editor;
