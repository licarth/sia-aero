import * as parser from "fast-xml-parser";
import * as FPArray from "fp-ts/lib/Array";
import { array } from "fp-ts/lib/Array";
import * as Either from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { none, some } from "fp-ts/lib/Option";
import fs from "fs";
import * as he from "he";
import { Iconv } from "iconv";
import { draw } from "io-ts/lib/Decoder";
import _, { flatMap, flow, groupBy, isString, keyBy, mapValues } from "lodash";
import * as fp from "lodash/fp";
import { filter } from "lodash/fp";
import path from "path";
import { addAutoInfoWhenNoOtherFrequency } from "../addAutoInfoWhenNoOtherFrequency";
import { aerodromeCodec } from "../domain/Aerodrome";
import { airacCycleCodec, AiracCycleData } from "../domain/AiracCycleData";
import { obstacleCodec } from "../domain/Obstacle";
import { VfrPoint, vfrPointCodec } from "../domain/VfrPoint";
import { Vor } from "../domain/Vor";
import { IGNORED_AERODROMES } from "../ignoredAerodromes";
import { extractAirspaces, extractDangerZones } from "./extractZones";
import { Obstacle, Rwy, SiaExport } from "./SiaExportTypes";

export const generateJson = (filePath: string) => {
  const windows1252EncodedFileReadStream = fs.readFileSync(filePath);

  const utf8FileReadStream = Iconv("windows-1252", "utf8").convert(
    windows1252EncodedFileReadStream
  );

  const postProcess = (entries: AiracCycleData) => ({
    ...entries,
    aerodromes: entries.aerodromes.map(addAutoInfoWhenNoOtherFrequency),
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
    var jsonObj = parser.parse(utf8FileReadStream.toString(), options);

    const {
      AdS: { Ad: ads },
      FrequenceS: { Frequence: frequences },
      ServiceS: { Service: services },
      EspaceS: { Espace: espaces },
      RwyS: { Rwy: rwys },
      ObstacleS: { Obstacle: obstacles },
      PartieS: { Partie: parties },
      VolumeS: { Volume: volumes },
      NavFixS: { NavFix: navFixes },
      RadioNavS: { RadioNav: radioNavs },
      _effDate,
    }: SiaExport = jsonObj.SiaExport.Situation;

    const servicesByAdId = groupBy(services, "Ad._pk");
    const serviceByEspaceId = _(services)
      .filter(({ Espace }) => Espace !== null)
      .groupBy("Espace._pk")
      .value();
    const frequencesByServiceId = groupBy(frequences, "Service._pk");
    const rwysByAdId = groupBy(rwys, "Ad._pk");

    const ctrServicesByAdId = mapValues(
      keyBy(
        flatMap(ads, ({ _pk, Ctr }) => (Ctr ? [{ Ctr, adId: _pk }] : [])),
        "adId"
      ),
      ({ Ctr }) => serviceByEspaceId[Ctr._pk]
    );

    const frequencesByAdId = flow(
      (adId) => {
        const ctrServices = ctrServicesByAdId[adId];
        return ctrServices
          ? [...servicesByAdId[adId], ...ctrServices]
          : servicesByAdId[adId];
      },
      (services) =>
        services
          ? services.map((service) => ({
              frequences: frequencesByServiceId[service._pk],
              service,
            }))
          : []
    );

    const allFrequences = ({
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
              (!indicService || IndicService === indicService)
          )
          .map(({ service, frequences }) =>
            frequences.map((f) => ({
              frequency: `${f.Frequence}`,
              remarks: f.Remarque,
            }))
          )
      )
        .uniqBy("frequency") //Removes duplicates for TWR
        .flatten()
        .value();

    const vfrPoints = pipe(
      navFixes,
      filter(({ NavType }) => NavType === "VFR"),
      FPArray.map(
        ({ Latitude, Longitude, Description, Ident, Territoire: { _lk } }) => {
          const [adLast2Letters, ...name] = Ident.split("-");
          const icaoCode = _lk.slice(1, -1) + adLast2Letters;
          return pipe(
            {
              description: Description || null,
              icaoCode: icaoCode,
              name: name.join("-"),
              latLng: {
                lat: Number(Latitude),
                lng: Number(Longitude),
              },
            },
            vfrPointCodec.decode,
            Either.orElseW((error) => {
              console.log("invalid VFR point: " + draw(error));
              return Either.right("");
            })
          );
        }
      ),
      FPArray.array.sequence(Either.either),
      Either.map((array) =>
        array.reduce<VfrPoint[]>((prev, curr) => {
          if (isString(curr)) {
            return prev;
          } else return [...prev, curr];
        }, [])
      )
    );

    const radioNavsByNavFixId = keyBy(radioNavs, "NavFix._pk");

    // console.log(
    //   Object.values(radioNavsByNavFixId).filter(
    //     ({ NomPhraseo, Station }) =>
    //       NomPhraseo && Station && NomPhraseo !== Station
    //   )
    // );

    const vors = pipe(
      navFixes,
      filter(({ NavType }) => ["VOR", "VOR-DME"].includes(NavType)),
      FPArray.map(({ Latitude, Longitude, Ident, NavType, _pk }) => {
        const radioNav = radioNavsByNavFixId[_pk];
        if (!radioNav) {
          return Either.right(`Could not find radioNav for navFix ${Ident}`);
        }
        const {
          Frequence,
          NomPhraseo,
          Station,
          Couverture,
          Portee,
          AltitudeFt,
        } = radioNav;
        return pipe(
          {
            ident: Ident,
            latLng: {
              lat: Number(Latitude),
              lng: Number(Longitude),
            },
            dme: NavType === "VOR-DME",
            name: Station || NomPhraseo || Ident,
            mapShortName: NomPhraseo || Ident,
            frequency: Frequence,
            coverage: Couverture,
            rangeInNm: Portee,
            altitude: AltitudeFt,
          },
          Vor.xmlCodec.decode,
          Either.orElseW((error) => {
            console.log("invalid VOR: " + draw(error));
            return Either.right("");
          })
        );
      }),
      FPArray.array.sequence(Either.either),
      Either.map((array) =>
        array.reduce<Vor[]>((prev, curr) => {
          if (isString(curr)) {
            console.log(curr);
            return prev;
          } else return [...prev, curr];
        }, [])
      )
    );

    const vfrPointsByIcaoCode = pipe(vfrPoints, fp.groupBy("icaoCode"));

    const buildAerodrome = ({
      ArpLat,
      AdRefAltFt,
      AdCode,
      AdStatut,
      Territoire,
      ArpLong,
      AdNomComplet,
      AdNomCarto,
      AdMagVar,
      _pk: adId,
    }) => {
      const icaoCode = `${Territoire._lk.substr(1, 2)}${AdCode}`;
      if (IGNORED_AERODROMES.includes(icaoCode)) {
        return none;
      }
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
        name: `${Rwy}`,
        surface: Revetement,
        magneticOrientation: Number(OrientationGeo),
        lengthInMeters: Number(Longueur),
      });
      const runways = rwysByAdId[adId]?.map(mapRwy);
      const mainRunway = rwysByAdId[adId]
        ?.filter(({ Principale }) => !Principale || Principale === "oui")
        .map(mapRwy)[0];

      return pipe(
        aerodromeCodec.decode({
          latLng: { lat: ArpLat, lng: ArpLong },
          aerodromeAltitude: AdRefAltFt,
          icaoCode,
          status: AdStatut,
          frequencies: {
            afis: allFrequences({ adId, service: "AFIS" }),
            atis: allFrequences({ adId, service: "ATIS" }),
            autoinfo: allFrequences({ adId, service: "A/A" }),
            ground: allFrequences({
              adId,
              service: "TWR",
              indicService: "Sol",
            }),
            tower: allFrequences({
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
          vfrPoints: vfrPointsByIcaoCode[icaoCode] || [],
        }),
        Either.fold(
          (e) => {
            console.log(`Ignoring aerodrome ${icaoCode}\n${draw(e)}`);
            return none;
          },
          (a) => some(a)
        )
      );
    };

    const buildObstacle = ({
      Latitude,
      Longitude,
      AmslFt,
      AglFt,
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
          (a) => some(a)
        )
      );
    };
    const partiesByEspaceId = groupBy(parties, "Espace._pk");
    const volumesByPartieId = groupBy(volumes, "Partie._pk");

    pipe(
      {
        aerodromes: pipe(ads, (ads) => ads.map(buildAerodrome), array.compact),
        obstacles: pipe(obstacles, (o) => o.map(buildObstacle), array.compact),
        vfrPoints: pipe(
          vfrPoints,
          Either.getOrElse(() => [])
        ),
        airspaces: extractAirspaces({
          espaces,
          parties,
          volumes,
          frequencesByServiceId,
        }),
        dangerZones: extractDangerZones({
          espaces,
          partiesByEspaceId,
          volumesByPartieId,
        }),
        vors: pipe(
          vors,
          Either.getOrElse(() => [])
        ),
      },
      postProcess,
      airacCycleCodec.encode,
      (airacData) =>
        fs.writeFileSync(
          path.resolve(__dirname, `../jsonData/${_effDate}.json`),
          JSON.stringify(airacData)
        )
    );
  }
};
