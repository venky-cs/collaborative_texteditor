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
      let totalText = this.quill?.getText();
      let re = new RegExp(Searcher.SearchedString, "gi");
      let match = re?.test(totalText);
      if (match) {
        let indices = (Searcher.occurrencesIndices = totalText?.getIndicesOf(
          Searcher.SearchedString
        ));
        let length = (Searcher.SearchedStringLength =
          Searcher.SearchedString?.length);

        indices?.forEach((index) =>
          this.quill?.formatText(index, length, "SearchedString", true)
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

    // let indices = Searcher.occurrencesIndices;

    let oldString = document?.getElementById("search-input")?.value;
    let newString = document?.getElementById("replace-input")?.value;

    this.quill?.deleteText(Searcher.occurrencesIndices[0], oldString?.length);
    this.quill?.insertText(Searcher.occurrencesIndices[0], newString);
    // this.quill?.formatText(
    //   indices[Searcher.currentIndex],
    //   newString?.length,
    //   "SearchedString",
    //   false
    // );
    // update the occurrencesIndices?.
    this?.search();
  }

  replaceAll() {
    if (!Searcher.SearchedString) return;
    let oldStringLen = document?.getElementById("search-input")?.value?.length;
    let newString = document?.getElementById("replace-input")?.value;

    // if no occurrences, then search first?.
    if (!Searcher.occurrencesIndices) this?.search();
    if (!Searcher.occurrencesIndices) return;

    if (Searcher.occurrencesIndices) {
      while (Searcher.occurrencesIndices) {
        this.quill?.deleteText(Searcher.occurrencesIndices[0], oldStringLen);
        this.quill?.insertText(Searcher.occurrencesIndices[0], newString);

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
    this.quill?.formatText(
      0,
      this.quill?.getText()?.length,
      "SearchedString",
      false
    );
  }
}

export default Searcher;
