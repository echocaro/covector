const vfile = require("to-vfile");
const globby = require("globby");
const path = require("path");
const TOML = require("@iarna/toml");

const parsePkg = (file) => {
  switch (file.extname) {
    case ".toml":
      const parsedTOML = TOML.parse(file.contents);
      return {
        name: parsedTOML.package.name,
        version: parsedTOML.package.version,
        pkg: parsedTOML,
      };
    case ".json":
      const parsedJSON = JSON.parse(file.contents);
      return {
        name: parsedJSON.name,
        version: parsedJSON.version,
        pkg: parsedJSON,
      };
  }
};

const stringifyPkg = ({ newContents, extname }) => {
  switch (extname) {
    case ".toml":
      return TOML.stringify(file.contents);
    case ".json":
      return `${JSON.stringify(newContents, null, "  ")}\n`;
  }
};

module.exports.readPkgFile = async (file) => {
  const inputVfile = await vfile.read(file, "utf8");
  const parsed = parsePkg(inputVfile);
  return {
    vfile: inputVfile,
    ...parsed,
  };
};

module.exports.writePkgFile = async ({ previousVFile, newContents }) => {
  const vFileNext = { ...previousVFile };
  vFileNext.contents = stringifyPkg({
    newContents,
    extname: previousVFile.extname,
  });
  const inputVfile = await vfile.write(vFileNext, "utf8");
  return inputVfile;
};

module.exports.configFile = async ({ cwd, changeFolder = ".changes" }) => {
  const inputVfile = await vfile.read(
    path.join(cwd, changeFolder, "config.json"),
    "utf8"
  );
  const parsed = JSON.parse(inputVfile.contents);
  return {
    vfile: inputVfile,
    ...parsed,
  };
};

module.exports.changeFiles = async ({ cwd, changeFolder = ".changes" }) => {
  const paths = await globby([path.posix.join(changeFolder, "*.md")], {
    cwd,
    ignore: ["**/readme.md"],
  });

  return paths
    .map((file) => vfile.readSync(path.join(cwd, file), "utf8"))
    .map((v) => v.contents);
};
