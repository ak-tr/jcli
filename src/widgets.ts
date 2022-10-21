import blessed from "blessed";

export const getListWidget = (listItems: string[], rows: number, cols: number) => {
  const listWidget = blessed.list({
    top: 0,
    right: 0,
    width: cols - listItems.length.toString().length - 1,
    height: rows - 1,
    items: listItems,
    keys: true,
    tags: true,
    style: {
      selected: {
        bg: "white",
        fg: "black",
      },
      item: {
        bold: true,
      }
    }
  })

  // Allow quit on Escape or Control-C or q.
  listWidget.key(["escape", "q", "C-c"], () => {
    return process.exit(0);
  });

  return listWidget;
}

export const getIndexWidget = (listLen: number, rows: number) => {
  const width = listLen.toString().length + 1;
  return blessed.list({
    top: 0,
    left: 0,
    width: width,
    height: rows - 1,
    items: Array.from({ length: listLen }, (_v, k) => (k + 1).toString().padStart(width - 1)),
    style: {
      selected: {
        transparent: true,
      },
      item: {
        transparent: true,
      }
    }
  })
}

export const getInfoBar = () => {
  return blessed.box({
    height: 1,
    bottom: 0,
    style: {
      bg: "white",
      fg: "black",
    },
    padding: {
      left: 1,
      right: 1,
    },
    tags: true,
  })
}