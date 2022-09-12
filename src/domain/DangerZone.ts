import { Option } from "fp-ts/lib/Option";
import * as t from "io-ts";
import { optionFromNullable } from "io-ts-types";
import * as Codec from "io-ts/Codec";
import { altitudeHeightFlightLevelSum } from "./AltitudeHeightFlightLevel";
import { dangerZoneTypeCodec } from "./DangerZoneType";
import { latLngCodec } from "./LatLng";

export namespace DangerZone {
  export const codec = Codec.struct({
    name: Codec.string,
    geometry: Codec.array(latLngCodec),
    lowerLimit: altitudeHeightFlightLevelSum,
    higherLimit: altitudeHeightFlightLevelSum,
    type: dangerZoneTypeCodec,
    remarks: optionFromNullable(t.string) as Codec.Codec<
      any,
      unknown,
      Option<string>
    >,
  });
}

export type DangerZone = Codec.TypeOf<typeof DangerZone.codec>;
