import blessed from "blessed";

export const getListWidget = (listItems: string[], rows: number) => {
  const listWidget = blessed.list({
    top: 0,
    width: "100%",
    height: rows - 3,
    items: listItems,
    keys: true,
    style: {
			selected: {
				bg: "white",
        fg: "black",
			}
		}
  })

  // Allow quit on Escape or Control-C or q.
  listWidget.key(["escape", "q", "C-c"], () => {
    return process.exit(0);
  });

  return listWidget;
}

export const getInfoBar = () => {
  return blessed.box({
    height: 1,
    bottom: 0,
    style: {
      bg: "white",
      fg: "black",
    },
    tags: true,
  })
}