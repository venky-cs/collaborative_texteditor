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

// yjs connection
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { QuillBinding } from "y-quill";

let quillInstance = null;

const Editor = () => {
  const quillRef = useRef(null);
  Quill?.register("modules/focus", Focus);
  Quill?.register("modules/cursors", QuillCursors);

  // find & replace
  class Searcher {
    constructor(quillInstance) {
      this.quill = quillInstance;
      this.container = document?.getElementById("search-container");

      document
        ?.getElementById("search")
        ?.addEventListener("click", this?.search?.bind(this));
      document
        ?.getElementById("search-input")
        ?.addEventListener("keyup", this?.keyPressedHandler?.bind(this));

      document
        ?.getElementById("replace")
        ?.addEventListener("click", this?.replace?.bind(this));
      document
        ?.getElementById("replace-all")
        ?.addEventListener("click", this?.replaceAll?.bind(this));
    }

    search() {
      //  remove any previous search
      Searcher.removeStyle();
      Searcher.SearchedString = document?.getElementById("search-input")?.value;
      if (Searcher.SearchedString) {
        let totalText = quillInstance?.getText();
        let re = new RegExp(Searcher.SearchedString, "gi");
        let match = re?.test(totalText);
        if (match) {
          let indices = (Searcher.occurrencesIndices = totalText?.getIndicesOf(
            Searcher.SearchedString
          ));
          let length = (Searcher.SearchedStringLength =
            Searcher.SearchedString?.length);

          indices?.forEach((index) =>
            quillInstance?.formatText(index, length, "SearchedString", true)
          );
        } else {
          Searcher.occurrencesIndices = null;
          Searcher.currentIndex = 0;
        }
      } else {
        Searcher.removeStyle();
      }
    }

    replace() {
      if (!Searcher.SearchedString) return;

      // if no occurrences, then search first?.
      if (!Searcher.occurrencesIndices) this?.search();
      if (!Searcher.occurrencesIndices) return;

      let indices = Searcher.occurrencesIndices;

      let oldString = document?.getElementById("search-input")?.value;
      let newString = document?.getElementById("replace-input")?.value;

      quillInstance?.deleteText(
        indices[Searcher.currentIndex],
        oldString?.length
      );
      quillInstance?.insertText(indices[Searcher.currentIndex], newString);
      quillInstance?.formatText(
        indices[Searcher.currentIndex],
        newString?.length,
        "SearchedString",
        false
      );
      // update the occurrencesIndices?.
      this?.search();
    }

    replaceAll() {
      if (!Searcher.SearchedString) return;
      let oldStringLen =
        document?.getElementById("search-input")?.value?.length;
      let newString = document?.getElementById("replace-input")?.value;

      // if no occurrences, then search first?.
      if (!Searcher.occurrencesIndices) this?.search();
      if (!Searcher.occurrencesIndices) return;

      if (Searcher.occurrencesIndices) {
        while (Searcher.occurrencesIndices) {
          quillInstance?.deleteText(
            Searcher.occurrencesIndices[0],
            oldStringLen
          );
          quillInstance?.insertText(Searcher.occurrencesIndices[0], newString);

          // update the occurrencesIndices?.
          this?.search();
        }
      }
      Searcher.removeStyle();
    }

    keyPressedHandler(e) {
      if (e?.key === "Enter") {
        this?.search();
      }
    }

    static removeStyle() {
      quillInstance?.formatText(
        0,
        quillInstance?.getText()?.length,
        "SearchedString",
        false
      );
    }
  }

  const Inline = Quill?.import("blots/inline");

  class SearchedStringBlot extends Inline {
    static create(value) {
      let node = super.create(value);
      node.contentEditable = "false";
      return node;
    }
  }

  SearchedStringBlot.blotName = "SearchedString";
  SearchedStringBlot.className = "ql-searched-string";
  SearchedStringBlot.tagName = "div";

  Quill?.register("modules/Searcher", Searcher);
  Quill?.register(SearchedStringBlot);

  useEffect(() => {
    if (!quillInstance && quillRef?.current) {
      quillInstance = new Quill(quillRef?.current, {
        theme: "snow",
        modules: {
          Searcher: true,
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
        <button id="replace-all">replace all</button>
      </div>
    </>
  );
};

export default Editor;
