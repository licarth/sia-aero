import * as parser from "fast-xml-parser";
import * as Either from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import fs from "fs";
import * as he from "he";
import * as Decoder from "io-ts/lib/Decoder";
import path from "path";
import { Aerodrome, aerodromeCodec } from "./domain/Aerodrome";
const filePath = path.resolve("./raw-data", "XML_SIA_2021-03-25.xml");
const fileReadStream = fs.createReadStream(filePath);

var options = {
  attributeNamePrefix: "@_",
  attrNodeName: "attributes", //default is 'false'
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

if (parser.validate(fs.readFileSync(filePath).toString()) === true) {
  //optional (it'll return an object in case it's not valid)
  var jsonObj = parser.parse(
    fs.readFileSync(filePath, { encoding: "ascii" }).toString(),
    options,
  );
  const aerodromes: Aerodrome[] = [];
  for (const Ad of jsonObj.SiaExport.Situation.AdS.Ad) {
    const { ArpLat, AdRefAltFt, AdCode, ArpLong } = Ad;
    pipe(
      aerodromeCodec.decode({
        latLng: { lat: ArpLat, lng: ArpLong },
        aerodromeAltitude: AdRefAltFt,
        icaoCode: `LF${AdCode}`,
      }),
      Either.fold(
        (r) => {
          // console.log(Ad);
          console.error(Decoder.draw(r));
          return r;
        },
        (a) => {
          aerodromes.push(a);
          return null;
        },
      ),
    );
  }
  console.log(
    aerodromes.map(
      ({ aerodromeAltitude, icaoCode }) => `${icaoCode}: ${aerodromeAltitude}`,
    ),
  );
}
