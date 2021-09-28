import * as Either from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import _, { Dictionary, groupBy, keyBy } from "lodash";
import { iso } from "newtype-ts";
import { Latitude, Longitude, remarksCodec } from "..";
import { Airspace } from "../domain/Airspace";
import { airspaceClassCodec } from "../domain/AirspaceClass";
import { airspaceTypeCodec } from "../domain/AirspaceType";
import { altitudeHeightFlightLevelSum } from "../domain/AltitudeHeightFlightLevel";
import { DangerZone } from "../domain/DangerZone";
import { dangerZoneTypeCodec } from "../domain/DangerZoneType";
import { Espace, Frequence, Partie, Volume } from "./SiaExportTypes";

export const extractAirspaces = ({
  espaces,
  parties,
  volumes,
  frequencesByServiceId,
}: {
  espaces: Espace[];
  parties: Partie[];
  volumes: Volume[];
  frequencesByServiceId: Dictionary<Frequence[]>;
}) => {
  const partiesByEspaceId = groupBy(parties, "Espace._pk");
  const volumesByPartieId = keyBy(volumes, "Partie._pk");
  return _(espaces)
    .filter(({ TypeEspace }) => ["CTR", "TMA", "CTA"].includes(TypeEspace))
    .flatMap(({ _pk: espacePk, Nom, TypeEspace }): Airspace[] => {
      return _.flatMap(
        partiesByEspaceId[espacePk],
        ({ Geometrie, _pk: partiePk, NomPartie }) => {
          const {
            Plancher,
            PlancherRefUnite,
            Plafond,
            PlafondRefUnite,
            Classe,
          } = volumesByPartieId[partiePk];
          return pipe(
            {} as any,
            Either.bind("lowerLimit", () =>
              altitudeHeightFlightLevelSum.decode(
                `${Plancher} ${PlancherRefUnite}`,
              ),
            ),
            Either.bind("higherLimit", () =>
              altitudeHeightFlightLevelSum.decode(
                `${Plafond} ${PlafondRefUnite}`,
              ),
            ),
            Either.bind("airspaceClass", () =>
              airspaceClassCodec.decode(`${Classe}`),
            ),
            Either.bind("type", () =>
              airspaceTypeCodec.decode(`${TypeEspace}`),
            ),
            Either.map(
              ({ lowerLimit, higherLimit, airspaceClass, type }): Airspace => ({
                name: _.compact([
                  `${TypeEspace}`,
                  `${Nom}`,
                  NomPartie === "." ? null : `${NomPartie}`,
                ]).join(" "),
                geometry: Geometrie.split("\n").map((latlngString) => {
                  const latlng = latlngString.split(",");
                  return {
                    lat: iso<Latitude>().wrap(Number(latlng[0])),
                    lng: iso<Longitude>().wrap(Number(latlng[1])),
                  };
                }),
                lowerLimit,
                higherLimit,
                airspaceClass,
                type,
              }),
            ),
            Either.fold(
              () => [],
              (a) => [a],
            ),
          );
        },
      );
    })
    .value();
};
export const extractDangerZones = ({
  espaces,
  partiesByEspaceId,
  volumesByPartieId,
}: {
  espaces: Espace[];
  partiesByEspaceId: Dictionary<Partie[]>;
  volumesByPartieId: Dictionary<Volume[]>;
}) => {
  return _(espaces)
    .filter(({ TypeEspace }) => ["P", "D", "R"].includes(TypeEspace))
    .flatMap(({ _pk: espacePk, Nom, TypeEspace }): DangerZone[] =>
      _.flatMap(partiesByEspaceId[espacePk], ({ Geometrie, _pk: partiePk }) =>
        _.flatMap(
          volumesByPartieId[partiePk],
          ({
            Plancher,
            PlancherRefUnite,
            Plafond,
            PlafondRefUnite,
            Remarque,
          }) =>
            pipe(
              {} as any,
              Either.bind("lowerLimit", () =>
                altitudeHeightFlightLevelSum.decode(
                  `${Plancher} ${PlancherRefUnite}`,
                ),
              ),
              Either.bind("higherLimit", () =>
                altitudeHeightFlightLevelSum.decode(
                  `${Plafond} ${PlafondRefUnite}`,
                ),
              ),
              Either.bind("type", () =>
                dangerZoneTypeCodec.decode(`${TypeEspace}`),
              ),
              Either.bind("remarks", () => remarksCodec.decode(`${Remarque}`)),
              Either.map(
                ({ lowerLimit, higherLimit, remarks, type }): DangerZone => ({
                  name: `${TypeEspace} ${Nom}`,
                  geometry: Geometrie.split("\n").map((latlngString) => {
                    const latlng = latlngString.split(",");
                    return {
                      lat: iso<Latitude>().wrap(Number(latlng[0])),
                      lng: iso<Longitude>().wrap(Number(latlng[1])),
                    };
                  }),
                  lowerLimit,
                  higherLimit,
                  type,
                  remarks,
                }),
              ),
              Either.fold(
                () => [],
                (a) => [a],
              ),
            ),
        ),
      ),
    )
    .value();
};
