import path from "path";
import { generateJson } from "./generate-single-json";
export * from "../domain";

const filePaths = [
  path.resolve("./raw-data", "XML_SIA_2022-08-11.xml"),
  path.resolve("./raw-data", "XML_SIA_2022-09-08.xml"),
];

filePaths.map((path) => generateJson(path));
