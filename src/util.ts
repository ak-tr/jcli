import fs from "fs/promises";

const getPath = (path: string) => `${__dirname}/${path}`;

export const readFile = async (path: string) => {
  try {
    // Load file from path
    const fileContents = await fs.readFile(getPath(path));
    // Check if valid JSON
    const parsedJSON = JSON.parse(fileContents.toString())
    // Turn JSON into array of beautified lines
    const lines = JSON.stringify(parsedJSON, null , 4).split("\n");

    return lines
  } catch (e) {
    // Handle JSON parser error
    if (e instanceof SyntaxError) {
      console.log(`Error parsing your .json file.\n${e.message}`);
    }

    // Handle fs.readFile error
    if (e instanceof Error) {
      console.log(`Error opening your file.\n${e.message}`);
    }

    return [];
  }
};
