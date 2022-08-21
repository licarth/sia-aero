import * as parser from "fast-xml-parser";
import * as FPArray from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";
import * as he from "he";
import { either } from "io-ts-types";
import path from "path";
import { IcaoCode, LatLng, ValidationFailure } from "../domain";
import { VfrPoint } from "../domain/VfrPoint";
import { sequenceS } from "fp-ts/Apply";
import { flatten } from "lodash/fp";
import { isString } from "lodash";

const filePath = path.resolve("./raw-data", "XML_SIA_2021-03-25.xml");

type WptAttributes = {
  _lat: string;
  _lon: string;
};

type Wpt = WptAttributes & {
  name: string;
  cmt: string;
};

type Gpx = {
  wpt: Wpt[];
};

type GpxFile = {
  gpx: Gpx;
};

var options = {
  attributeNamePrefix: "_",
  // attrNodeName: false, //default is 'false'
  textNodeName: "#text",
  ignoreAttributes: false,
  ignoreNameSpace: false,
  allowBooleanAttributes: true,
  parseNodeValue: true,
  parseAttributeValue: false,
  trimValues: true,
  cdataTagName: "__cdata", //default is 'false'
  cdataPositionChar: "\\c",
  parseTrueNumberOnly: false,
  arrayMode: false, //"strict"
  attrValueProcessor: (val, attrName) =>
    he.decode(val, { isAttributeValue: true }), //default is a=>a
  tagValueProcessor: (val, tagName) => he.decode(val), //default is a=>a
  stopNodes: ["parse-me-as-string"],
};

export const importVfrPoints = (gpxString: string) => {
  const jsonObj: GpxFile = parser.parse(gpxString, options);

  return pipe(
    jsonObj.gpx.wpt,
    FPArray.map(({ _lat, _lon, cmt, name }) =>
      pipe(
        {
          description: E.right(cmt),
          icaoCode: IcaoCode.parse(name.split("/")[0]),
          name: E.right(name.split("/")[1]),
          latLng: LatLng.parse({ lat: Number(_lat), lng: Number(_lon) }),
        },
        sequenceS(E.Applicative),
        E.orElseW(() => E.right("invalid VFR point"))
      )
    ),
    FPArray.array.sequence(E.either),
    E.map((array) =>
      array.reduce<VfrPoint[]>(
        (prev, curr) => (isString(curr) ? prev : [...prev, curr]),
        []
      )
    )
  );
};
