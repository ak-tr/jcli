export interface FoldedLines {
  startingIndex: number,
  indexBarIndex: number,
  foldedLines: Line[]
}

export interface Line {
  index: number,
  content: string,
}