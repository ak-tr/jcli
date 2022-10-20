import blessed from "blessed";
import { getInfoBar, getListWidget } from "./widgets";

export class UI {
  screen: blessed.Widgets.Screen;

  fileName: string;
  linesFromFile: string[];
  maxIndex: number;

  listIndex: number;

  constructor(fileName: string, linesFromFile: string[]) {
    // Create a screen object.
    this.screen = blessed.screen({
      smartCSR: true,
      autoPadding: true,
      dockBorders: true,
      log: "log.txt",
    });

    this.linesFromFile = linesFromFile;
    this.fileName = fileName;
  
    this.maxIndex = linesFromFile.length + 1;
    this.listIndex = 1;

    this._showUI()
  }

  _showUI = () => {
    const list = getListWidget(this.linesFromFile, this.screen.rows);
    const infoBar = getInfoBar();

    // Set inital content
    infoBar.setContent(getInfoBarContentString(this.listIndex, this.fileName))

    // Focus list on initial load
    list.focus();

    // Special key functions
    list.key(["up", "down", "C-down", "C-up"], (_ch, key) => {
      this._updateListIndex(key.name, key.ctrl, list);
      infoBar.setContent(getInfoBarContentString(this.listIndex, this.fileName))
      this.screen.render();
    });

    list.on("select", (item) => {
      this.screen.log(list.getItemIndex(item), list.getItem(item).content);
    });

    [list, infoBar].forEach((widget) => this.screen.append(widget));

    this.screen.render();
  }

  _updateListIndex = (keyEvent: string, ctrl: boolean, list: blessed.Widgets.ListElement) => {
    let offset = 0;

    if ((this.listIndex == 1) && (keyEvent == Key.Up)) {
      return this.listIndex;
    }

    // If EOF and key down don't update index
    if ((this.listIndex == this.maxIndex) && (keyEvent == Key.Down)) {
      return this.listIndex;
    }

    // If less than 10 lines remaining to the end and ctrl is held, go to end
    if ((keyEvent == Key.Down) && (this.listIndex >= this.maxIndex - 11) && ctrl) {
      list.select(this.maxIndex - 1);
      return this.listIndex = this.maxIndex;
    }

    // If less than 10 lines remaining to the beginning, go to end
    if ((keyEvent == Key.Up) && (this.listIndex <= 11) && ctrl) {
      list.select(0);
      return this.listIndex = 1;
    }

    if (ctrl) {
      // Value 9 because single key press already makes offset 1
      offset = keyEvent == Key.Down ? 9 : -9;
      list.move(offset);
    }

    return this.listIndex += (keyEvent == Key.Up ? -1 : 1) + offset;
  }
}

enum Key {
  Down = "down",
  Up = "up",
}

const getInfoBarContentString = (listIndex: number, fileName: string) => {
  return `row: ${listIndex} (${listIndex - 1}){|}${fileName}`;
}