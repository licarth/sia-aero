import * as parser from "fast-xml-parser";
import * as Either from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import fs from "fs";
import * as he from "he";
import _, {
  Dictionary,
  flatMap,
  flatten,
  flow,
  groupBy,
  keyBy,
  mapValues
} from "lodash";
import path from "path";
import { Aerodrome, aerodromeCodec } from "./domain/Aerodrome";

const filePath = path.resolve("./raw-data", "XML_SIA_2021-03-25.xml");
const fileReadStream = fs.createReadStream(filePath);

var options = {
  attributeNamePrefix: "",
  attrNodeName: "attrs", //default is 'false'
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

  type Attributes = {
    attrs: {
      pk: string;
      lk: string;
    };
  };

  type Ad = Attributes & {
    Ctr?: Attributes;
    Territoire: Attributes;
    AdCode: Attributes;
    ArpLat: string;
    AdRefAltFt: string;
    ArpLong: string;
  };
  type Espace = Attributes & {};

  type Frequence = Attributes & {
    Ad: Attributes;
    Frequence: number;
  };

  type Service = Attributes & {
    Service: string;
    IndicService: string;
    Espace?: Attributes;
  };

  type SiaExport = {
    AdS: {
      Ad: Array<Ad>;
    };
    FrequenceS: {
      Frequence: Array<Frequence>;
    };
    ServiceS: {
      Service: Array<Service>;
    };
    EspaceS: {
      Espace: Array<Espace>;
    };
  };

  const {
    AdS: { Ad },
    FrequenceS: { Frequence },
    ServiceS: { Service },
    EspaceS: { Espace },
  }: SiaExport = jsonObj.SiaExport.Situation;

  const adById = keyBy(Ad, "attrs.pk");
  const servicesByAdId = groupBy(Service, "Ad.attrs.pk");
  const serviceById = keyBy(Service, "attrs.pk");
  const serviceByEspaceId = _(Service)
    .filter(({ Espace }) => Espace !== null)
    .groupBy("Espace.attrs.pk")
    .value();
  const espaceById = keyBy(Espace, "attrs.pk");
  const frequencesByServiceId = groupBy(Frequence, "Service.attrs.pk");

  const ctrServicesByAdId = mapValues(
    keyBy(
      flatMap(Ad, ({ attrs: { pk }, Ctr }) => (Ctr ? [{ Ctr, adId: pk }] : [])),
      "adId",
    ),
    ({ Ctr }) => serviceByEspaceId[Ctr.attrs.pk],
  );

  const frequencesByAdId = flow(
    (adId) => {
      // if (adId == 14) {
      //   console.log(servicesByAdId[adId]);
      // }
      const ctrServices = ctrServicesByAdId[adId];
      return ctrServices
        ? [...servicesByAdId[adId], ...ctrServices]
        : servicesByAdId[adId];
    },
    (services) => {
      return services
        ? services.map((service) => {
            if (service.attrs.pk == "720") {
              // console.log(service);
              // console.log(frequencesByServiceId[service.attrs.pk]);
            }
            return {
              frequences: frequencesByServiceId[service.attrs.pk],
              service,
            };
          })
        : [];
    },
  );

  const aerodromes: Dictionary<Aerodrome[]> = {};
  // console.log(keys(jsonObj.SiaExport.Situation));
  // console.log(jsonObj.SiaExport.Situation.AdS.Ad[100]);
  for (const Ad of jsonObj.SiaExport.Situation.AdS.Ad) {
    if (Ad.attrs.pk == 14) {
      console.log(JSON.stringify(frequencesByAdId(Ad.attrs.pk)));
    }
    const {
      ArpLat,
      AdRefAltFt,
      AdCode,
      Territoire,
      ArpLong,
      attrs: { pk: adId },
    }: Ad = Ad;
    // console.log(pk);
    pipe(
      aerodromeCodec.decode({
        latLng: { lat: ArpLat, lng: ArpLong },
        aerodromeAltitude: AdRefAltFt,
        icaoCode: `${Territoire.attrs.lk.substr(1, 2)}${AdCode}`,
        frequencies: {
          atis: flatten(
            frequencesByAdId(adId)
              .filter(({ service: { Service } }) => Service === "ATIS")
              .map(({ service, frequences }) =>
                frequences.map((f) => `${f.Frequence}`),
              ),
          ),
          autoinfo: flatten(
            frequencesByAdId(adId)
              .filter(
                ({ service: { Service, IndicService } }) => Service === "A/A",
              )
              .map(({ service, frequences }) =>
                frequences.map((f) => `${f.Frequence}`),
              ),
          ),
          ground: flatten(
            frequencesByAdId(adId)
              .filter(
                ({ service: { Service, IndicService } }) =>
                  Service === "TWR" && IndicService === "Sol",
              )
              .map(({ service, frequences }) =>
                frequences.map((f) => `${f.Frequence}`),
              ),
          ),
          tower: _(
            frequencesByAdId(adId)
              .filter(({ service, frequences }) => {
                const { Service, IndicService } = service;
                return Service === "TWR" && IndicService === "Tour";
              })
              .map(({ service, frequences }) =>
                frequences.map((f) => `${f.Frequence}`),
              ),
          )
            .flatten()
            .uniq()
            .value(),
        },
      }),
      Either.fold(
        (r) => {
          // console.error(Decoder.draw(r));
          return r;
        },
        (a) => {
          //@ts-ignore
          aerodromes[a.icaoCode] = a;
          //@ts-ignore
          if (a.icaoCode === "LFMU") console.log(a);
          return null;
        },
      ),
    );
  }

  // console.log(aerodromes);
  // setTimeout(() =>
  // {console.log(aerodromes["LFMU"]);
  // }, 10000)
  // console.log(JSON.stringify(frequencesByAdId("66")));
  // console.log(serviceById["5410"]);

  // console.log(
  //   aerodromes.map(
  //     ({ aerodromeAltitude, icaoCode }) => `${icaoCode}: ${aerodromeAltitude}`,
  //   ),
  // );
}
