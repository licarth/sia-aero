import path from "path";
import glob from "glob-promise";
import fs from "fs";
import { generateJson } from "./generate-single-json";
export * from "../domain";
import { Iconv } from "iconv";
import extract from "extract-zip";

// const filePaths = [
//   path.resolve("./raw-data", "XML_SIA_2022-08-11.xml"),
//   path.resolve("./raw-data", "XML_SIA_2022-09-08.xml"),
// ];

(async () => {
  const zipFiles = await glob.promise("./raw-data/*.zip");
  console.log(zipFiles);

  await Promise.all(
    zipFiles.map(async (filePath) => {
      try {
        await extract(filePath, {
          dir: path.resolve(__dirname, "../../raw-data"),
        });
      } catch (error) {
        console.log(error);
      }
    })
  );

  const xmlFiles = await glob.promise("./raw-data/XML_SIA*.xml");
  console.log(xmlFiles);
  xmlFiles.map(async (filePath) => {
    const windows1252EncodedFileReadStream = fs.readFileSync(filePath);

    const utf8FileReadStream = Iconv("windows-1252", "utf8").convert(
      windows1252EncodedFileReadStream
    );

    generateJson(utf8FileReadStream);
  });
})();

// filePaths.map((path) => generateJson(path));
