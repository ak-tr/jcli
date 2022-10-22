import blessed from "blessed";
import { FoldedLines, Line } from "./types";
import { getIndexWidget, getInfoBar, getListWidget } from "./widgets";

export class UI {
  screen: blessed.Widgets.Screen;

  fileName: string;
  linesFromFile: string[];
  maxIndex: number;
  width: number;

  listIndex: number;
  actualIndex: number;
  foldedElements: FoldedLines[];

  constructor(fileName: string, linesFromFile: string[]) {
    // Create a screen object.
    this.screen = blessed.screen({
      smartCSR: true,
      autoPadding: true,
      dockBorders: true,
      log: "log.txt",
      debug: true,
    });

    this.linesFromFile = linesFromFile;
    this.fileName = fileName;
  
    this.maxIndex = linesFromFile.length;
    this.listIndex = 1;
    this.actualIndex = 0;
    this.foldedElements = [];
    this.width = this.maxIndex.toString().length + 1;

    this._showUI()
  }

  _showUI = () => {
    const list = getListWidget(this.linesFromFile, this.screen.rows, this.screen.cols);
    const indexBar = getIndexWidget(this.maxIndex, this.screen.rows, this.width);
    const infoBar = getInfoBar();

    // Set inital content
    infoBar.setContent(getInfoBarContentString(this.listIndex, this.fileName))

    // Focus list on initial load
    list.focus();

    // Special key functions
    list.key(["up", "down", "S-down", "S-up"], (_ch, key) => {
      this._updateListIndex(key.name, key.shift, list, indexBar);
      infoBar.setContent(getInfoBarContentString(this.listIndex, this.fileName))
      indexBar.select(this.listIndex - 1);

      this.screen.render();
    });

    list.on("select", (item) => {
      // Index of selected item
      const index = list.getItemIndex(item);
      // Content of selected item
      const content = list.getItem(index).content;

      const isLineFolded = this._checkIfLineIsFolded(index);      
      if (isLineFolded) {
        this._unfoldLines(list, indexBar, index);
        list.select(index);
        return this.screen.render();
      }

      // If no opening curly brace or square bracket, guard
      if (![Char.BraceOpen, Char.BracketOpen].some((br) => content.includes(br))) {
        return;
      }

      const openingChar = getOpeningChar(content);

      const matchedClosingChar = getMatchedClosingChar(openingChar);
      const closingCharIndex = getIndexOfClosingChar(list, index, openingChar, matchedClosingChar);

      this._foldAndStoreLines(index, closingCharIndex - (index - 1));
      [list, indexBar].forEach((list) => list.spliceItem(index + 1, closingCharIndex - (index)));
      list.setItem(item, `${content} ... ${matchedClosingChar}`);
      this.screen.render();
    });

    [list, indexBar, infoBar].forEach((widget) => this.screen.append(widget));

    this.screen.render();
  }

  _updateListIndex = (keyEvent: string, shift: boolean, list: blessed.Widgets.ListElement, indexBar: blessed.Widgets.ListElement) => {
    let offset = 0;

    if ((this.listIndex == 1) && (keyEvent == Key.Up)) {
      return this.listIndex;
    }

    // If EOF and key down don't update index
    if ((this.listIndex == this.maxIndex) && (keyEvent == Key.Down)) {
      return this.listIndex;
    }

    // If less than 10 lines remaining to the end and ctrl is held, go to end
    if ((keyEvent == Key.Down) && (this.listIndex >= this.maxIndex - 11) && shift) {
      list.select(this.maxIndex - 1);
      return this.listIndex = this.maxIndex;
    }

    // If less than 10 lines remaining to the beginning, go to end
    if ((keyEvent == Key.Up) && (this.listIndex <= 11) && shift) {
      list.select(0);
      return this.listIndex = 1;
    }

    // Hop 10 spaces in list
    if (shift) {
      // Value 9 because single key press already makes offset 1
      offset = keyEvent == Key.Down ? 9 : -9;
      list.move(offset);
    }

    this.listIndex += (keyEvent == Key.Up ? -1 : 1) + offset;
    this.actualIndex = +indexBar.getItem(this.listIndex).content;
    return;
  }

  _foldAndStoreLines = (startingIndex: number, endingIndex: number) => {
    // Clone array to prevent mutation from slice prototype
    const cloned = [...this.linesFromFile];
    const foldedLinesContent = cloned.splice(startingIndex, endingIndex);

    // Store lines in foldedLines variable to restore later...
    const foldedLines = foldedLinesContent.reduce((a, c, i) => {
      a.push({
        index: startingIndex + i,
        content: c,
      });
      return a;
    }, [] as Line[])

    this.foldedElements.push({
      startingIndex,
      foldedLines,
      indexBarIndex: this.actualIndex,
    })
  }

  _unfoldLines = (list: blessed.Widgets.ListElement, indexBar: blessed.Widgets.ListElement, startingIndex: number) => {
    this.screen.log(this.foldedElements);
    const foldedLines = this.foldedElements.find((fe) => fe.startingIndex === startingIndex);
    const foldedContent = foldedLines?.foldedLines.map((fe) => {
      return fe.content as unknown as blessed.Widgets.TextElement
    });

    if (foldedLines === undefined) {
      return;
    }

    const length = foldedLines.foldedLines.length;
    const foldedIndexes = Array.from({ length }, (_v, k) => {
      return (k + foldedLines.indexBarIndex - 1).toString().padStart(this.width - 1) as unknown as blessed.Widgets.TextElement
    });
    
    if (foldedContent != undefined && foldedIndexes != undefined) {
      list.spliceItem(startingIndex, 1, ...foldedContent)
      indexBar.spliceItem(startingIndex, 1, ...foldedIndexes)
    }
    
    this.foldedElements = this.foldedElements.filter((fe) => fe.startingIndex === startingIndex - 1);
  }

  _checkIfLineIsFolded = (index: number) => this.foldedElements.some((fe) => fe.startingIndex === index);
}

enum Key {
  Down = "down",
  Up = "up",
}

enum Char {
  BraceOpen = "{",
  BraceClose = "}",
  BracketOpen = "[",
  BracketClose = "]",
}

const getIndexOfClosingChar = (list: blessed.Widgets.ListElement, index: number, openingChar: Char, closingChar: Char) => {
  const counts = {
    open: 1,
    close: 0,
  }

  while (counts.open != counts.close) {
    const content = list.getItem(++index).content;
    
    counts.open += content.includes(openingChar) ? 1 : 0;
    counts.close += content.includes(closingChar) ? 1 : 0;
  }

  return index;
}

const getOpeningChar = (content: string) => {
  if (content.includes(Char.BraceOpen)) return Char.BraceOpen;
  else return Char.BracketOpen;
}

const getMatchedClosingChar = (symbol: Char) => {
  if (symbol == Char.BraceOpen) return Char.BraceClose
  else return Char.BracketClose
}

const getInfoBarContentString = (listIndex: number, fileName: string) => {
  return `row: ${listIndex - 1} (${listIndex}){|}${fileName}`;
}