import commandLineArgs from "command-line-args";
import commandLineUsage from "command-line-usage";
import { UI } from "./ui";
import { readFile } from "./util";

const optionDefinitions = [
  {
    name: "help",
    alias: "h",
    type: Boolean,
    description: "Display the usage guide",
  },
  {
    name: "file",
    alias: "f",
    type: String,
    description: "File to parse and display (.json)"
  }
]

const options = commandLineArgs(optionDefinitions, {partial: true});

const isEmpty = (obj: Record<string, unknown>) => {
  return Object.keys(obj).length == 0;
}

const generateCommandLineUsage = () => {
  return commandLineUsage([
    {
      content: `
░░░░░██╗░█████╗░██╗░░░░░██╗
░░░░░██║██╔══██╗██║░░░░░██║
░░░░░██║██║░░╚═╝██║░░░░░██║
██╗░░██║██║░░██╗██║░░░░░██║
╚█████╔╝╚█████╔╝███████╗██║
░╚════╝░░╚════╝░╚══════╝╚═╝

JCLI is a command line tool to view JSON files.
Refer to the usage below for further details.`,
      raw: true,
    },

    {
      header: "Usage",
      content: "$ jcli [PATH] [-f PATH] [--file PATH] [-h] [--help]",
    },
    {
      header: "Example Usages",
      content: "$ jcli -f file.json\n$ jcli --file file.json",
    },
    {
      header: "Available Commands",
      optionList: optionDefinitions,
    },
    {
      content: "Project home: {underline https://github.com/ak-tr/jcli}",
    }
  ]);
};

const parseCommandLineArgs = async () => {
  if (isEmpty(options)) {
    return console.log("Unknown command, use --help for the usage guide")
  }

  if (options.help) {
    return console.log(generateCommandLineUsage());
  }

  let fileName = "";

  if (options._unknown !== undefined) {
    if (options._unknown.length > 1 || !options._unknown[0].endsWith(".json")) {
      return console.log("Invalid options, use --help for the usage guide");
    }
    fileName = options._unknown[0];
  }

  if (options.file) {
    if (!options.file.endsWith(".json")) {
      return console.log("Invalid file type, use --help for the usage guide");
    }
    fileName = options.file;
  }

  if (fileName === "") {
    return console.log("No file was provided, use --help for the usage guide");
  }

  const lines = await readFile(fileName);
    
  // If lines exists
  if (lines.length > 0) {
    new UI(fileName, lines);
  }
};

parseCommandLineArgs().catch();