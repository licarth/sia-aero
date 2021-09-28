import _, { groupBy, keyBy } from "lodash";
import { Ctr } from "../domain/Ctr";
import { Espace, Partie, Volume } from "./SiaExportTypes";
import * as Either from "fp-ts/lib/Either";
import { altitudeHeightFlightLevelSum } from "../domain/AltitudeHeightFlightLevel";
import { airspaceClassCodec } from "../domain/AirspaceClass";
import { pipe } from "fp-ts/lib/function";
import { iso } from "newtype-ts";
import { Latitude, Longitude } from "..";
export const extractCtrInfo = ({
  espaces,
  parties,
  volumes,
}: {
  espaces: Espace[];
  parties: Partie[];
  volumes: Volume[];
}) => {
  const partiesByEspaceId = groupBy(parties, "Espace._pk");
  const volumesByPartieId = keyBy(volumes, "Partie._pk");
  return _(espaces)
    .filter(({ TypeEspace }) => ["CTR", "TMA"].includes(TypeEspace))
    .flatMap(({ _pk: espacePk, Nom }): Ctr[] => {
      return _.flatMap(
        partiesByEspaceId[espacePk],
        ({ Geometrie, _pk: partiePk }) => {
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
            Either.map(
              ({ lowerLimit, higherLimit, airspaceClass }): Ctr => ({
                name: `${Nom}`,
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
