import * as parser from "fast-xml-parser";
import { array } from "fp-ts/lib/Array";
import * as Either from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { none, some } from "fp-ts/lib/Option";
import fs from "fs";
import * as he from "he";
import { draw } from "io-ts/lib/Decoder";
import _, { flatMap, flow, groupBy, keyBy, mapValues } from "lodash";
import path from "path";
import { AUTOINFO, Frequencies } from "./domain";
import { Aerodrome, aerodromeCodec } from "./domain/Aerodrome";
import { airacCycleCodec, AiracCycleData } from "./domain/AiracCycleData";
import { obstacleCodec } from "./domain/Obstacle";


const filePath = path.resolve("./raw-data", "XML_SIA_2021-03-25.xml");
const fileReadStream = fs.createReadStream(filePath);

export * from "./domain";

const addMissingAutoInfoFrequency = (a: Aerodrome): Aerodrome => {
  if (
    a.frequencies.autoinfo.length === 0 &&
    a.frequencies.afis.length === 0 &&
    a.frequencies.tower.length === 0
  ) {
    const frequencies: Frequencies = {
      ...a.frequencies,
      autoinfo: [{ frequency: AUTOINFO, remarks: none }],
    };
    return { ...a, frequencies };
  }
  return a;
};

const postProcess = (entries: AiracCycleData): AiracCycleData => ({
  aerodromes: entries.aerodromes.map(addMissingAutoInfoFrequency),
  obstacles: [],
});

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

if (parser.validate(fs.readFileSync(filePath).toString()) === true) {
  //optional (it'll return an object in case it's not valid)
  var jsonObj = parser.parse(
    fs.readFileSync(filePath, { encoding: "ascii" }).toString(),
    options,
  );

  type Attributes = {
    _pk: string;
    _lk: string;
  };

  type Ad = Attributes & {
    Ctr?: Attributes;
    Territoire: Attributes;
    AdCode: Attributes;
    ArpLat: string;
    AdRefAltFt: string;
    ArpLong: string;
    AdNomComplet: string;
    AdNomCarto: string;
    AdMagVar: string;
  };

  type Espace = Attributes & {};

  type Rwy = Attributes & {
    OrientationGeo: number;
    Longueur: number;
    Rwy: string;
    Principale: "oui" | "non";
    Revetement: string;
  };

  type Obstacle = Attributes & {
    Latitude: number;
    Longitude: number;
    TypeObst: string;
    Combien: number;
    AmslFt: number;
    AglFt: number;
    Geometrie: string;
  };

  type Frequence = Attributes & {
    Ad: Attributes;
    Frequence: number;
    Remarque: string;
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
    RwyS: {
      Rwy: Array<Rwy>;
    };
    ObstacleS: {
      Obstacle: Array<Obstacle>;
    };
  };

  const {
    AdS: { Ad },
    FrequenceS: { Frequence },
    ServiceS: { Service },
    EspaceS: { Espace },
    RwyS: { Rwy },
    ObstacleS: { Obstacle },
  }: SiaExport = jsonObj.SiaExport.Situation;

  const adById = keyBy(Ad, "_pk");
  const servicesByAdId = groupBy(Service, "Ad._pk");
  const serviceById = keyBy(Service, "_pk");
  const serviceByEspaceId = _(Service)
    .filter(({ Espace }) => Espace !== null)
    .groupBy("Espace._pk")
    .value();
  const espaceById = keyBy(Espace, "_pk");
  const frequencesByServiceId = groupBy(Frequence, "Service._pk");
  const rwysByAdId = groupBy(Rwy, "Ad._pk");

  // console.log(JSON.stringify(rwysByAdId["66"]));
  // //@ts-ignore
  // return;

  const ctrServicesByAdId = mapValues(
    keyBy(
      flatMap(Ad, ({ _pk, Ctr }) => (Ctr ? [{ Ctr, adId: _pk }] : [])),
      "adId",
    ),
    ({ Ctr }) => serviceByEspaceId[Ctr._pk],
  );

  const frequencesByAdId = flow(
    (adId) => {
      const ctrServices = ctrServicesByAdId[adId];
      return ctrServices
        ? [...servicesByAdId[adId], ...ctrServices]
        : servicesByAdId[adId];
      // return servicesByAdId[adId];
    },
    (services) => {
      return services
        ? services.map((service) => {
            if (service._pk == "720") {
              // console.log(service);
              // console.log(frequencesByServiceId[service._pk]);
            }
            return {
              frequences: frequencesByServiceId[service._pk],
              service,
            };
          })
        : [];
    },
  );

  console.log(frequencesByAdId(66));

  const frequences = ({
    service,
    indicService,
    adId,
  }: {
    service: string;
    indicService?: string;
    adId: string;
  }) =>
    _(
      frequencesByAdId(adId)
        .filter(
          ({ service: { Service, IndicService } }) =>
            Service === service &&
            (!indicService || IndicService === indicService),
        )
        .map(({ service, frequences }) =>
          frequences.map((f) => ({
            frequency: `${f.Frequence}`,
            remarks: f.Remarque,
          })),
        ),
    )
      .uniqBy("frequency") //Removes duplicates for TWR
      .flatten()
      .value();

  const buildAerodrome = ({
    ArpLat,
    AdRefAltFt,
    AdCode,
    Territoire,
    ArpLong,
    AdNomComplet,
    AdNomCarto,
    AdMagVar,
    _pk: adId,
  }) => {
    const icaoCode = `${Territoire._lk.substr(1, 2)}${AdCode}`;
    const mapRwy = ({
      Longueur,
      OrientationGeo,
      Revetement,
      Rwy,
    }: Rwy): {
      name: string;
      surface: string;
      magneticOrientation: number;
      lengthInMeters: number;
    } => ({
      name: Rwy,
      surface: Revetement,
      magneticOrientation: Number(OrientationGeo),
      lengthInMeters: Number(Longueur),
    });
    const runways = rwysByAdId[adId]?.map(mapRwy);
    const mainRunway = rwysByAdId[adId]
      ?.filter(({ Principale }) => Principale === "oui")
      .map(mapRwy)[0];

    return pipe(
      aerodromeCodec.decode({
        latLng: { lat: ArpLat, lng: ArpLong },
        aerodromeAltitude: AdRefAltFt,
        icaoCode,
        frequencies: {
          afis: frequences({ adId, service: "AFIS" }),
          atis: frequences({ adId, service: "ATIS" }),
          autoinfo: frequences({ adId, service: "A/A" }),
          ground: frequences({
            adId,
            service: "TWR",
            indicService: "Sol",
          }),
          tower: frequences({
            adId,
            service: "TWR",
            indicService: "Tour",
          }),
        },
        name: AdNomComplet,
        mapShortName: AdNomCarto,
        magneticVariation: AdMagVar,
        runways: {
          runways,
          mainRunway,
        },
      }),
      Either.fold(
        (e) => {
          console.log(`Ignoring aerodrome ${icaoCode}\n${draw(e)}`);
          return none;
        },
        (a) => some(a),
      ),
    );
  };

  const buildObstacle = ({
    Latitude,
    Longitude,
    TypeObst,
    Combien,
    AmslFt,
    AglFt,
    Geometrie,
  }: Obstacle) => {
    return pipe(
      obstacleCodec.decode({
        latLng: { lat: Latitude, lng: Longitude },
        amslAltitude: AmslFt,
        aglHeight: AglFt,
      }),
      Either.fold(
        (e) => {
          console.log(`Ignoring obstacle ${`ADDOBSTACLEID`}\n${draw(e)}`);
          return none;
        },
        (a) => some(a),
      ),
    );
  };

  const aerodromes: Aerodrome[] = [];
  // console.log(keys(jsonObj.SiaExport.Situation));
  // console.log(jsonObj.SiaExport.Situation.AdS.Ad[100]);

  pipe(
    {
      aerodromes: pipe(Ad, (ads) => ads.map(buildAerodrome), array.compact),
      obstacles: pipe(Obstacle, (o) => o.map(buildObstacle), array.compact),
    },
    postProcess,
    airacCycleCodec.encode,
    (airacData) =>
      fs.writeFileSync(
        path.resolve(__dirname, "./jsonData/2021_03_25/aerodromes.json"),
        JSON.stringify(airacData),
      ),
  );
}
