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

const options = commandLineArgs(optionDefinitions);

const isEmpty = (obj: Record<string, unknown>) => {
  return Object.keys(obj).length == 0;
}

const generateCommandLineUsage = () => {
  return commandLineUsage([
    {
      header: "Usage",
      content: "jcli [-f PATH] [--file PATH] [-h] [--help]"
    },
    {
      header: "Example Usages",
      content: "jcli -f file.json\njcli --file file.json"
    },
    {
      header: "Available Commands",
      optionList: optionDefinitions
    },
    {
      content: "Project home: {underline https://github.com/ak-tr/jcli}"
    }
  ]);
};

const parseCommandLineArgs = async () => {
  if (isEmpty(options)) {
    return console.log(generateCommandLineUsage())
  }

  if (options.help) {
    return console.log(generateCommandLineUsage());
  }

  if (options.file) {
    const fileName = options.file;
    const lines = await readFile(fileName);
    
    // If lines exists
    if (lines.length > 0) {
      new UI(fileName, lines);
    }
  }
};

parseCommandLineArgs().catch();