export interface FoldedLines {
  startingIndex: number,
  foldedLines: Line[]
}

export interface Line {
  index: number,
  content: string,
}