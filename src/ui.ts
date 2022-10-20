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

    list.focus();
    list.key(["up", "down"], (_ch, key) => {
      this._updateListIndex(key.name);
      infoBar.setContent(getInfoBarContentString(this.listIndex, this.fileName))
      this.screen.render();
    });

    [list, infoBar].forEach((widget) => this.screen.append(widget));

    this.screen.render();
  }

  _updateListIndex = (keyEvent: string) => {
    // If already at top and key up don't change index
    if ((this.listIndex == 1) && (keyEvent == Key.Up)) {
      return
    }

    // If EOF and key down don't update index
    if ((this.listIndex == this.maxIndex) && (keyEvent == Key.Down)) {
      return
    }

    this.listIndex += keyEvent == Key.Up ? -1 : 1;
  }
}

enum Key {
  Down = "down",
  Up = "up",
}

const getInfoBarContentString = (listIndex: number, fileName: string) => {
  return `row: ${listIndex} (${listIndex - 1}){|}${fileName}`;
}