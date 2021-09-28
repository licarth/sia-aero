import { Option } from "fp-ts/lib/Option";
import * as t from "io-ts";
import { optionFromNullable } from "io-ts-types";
import * as Codec from "io-ts/Codec";
import { altitudeHeightFlightLevelSum } from "./AltitudeHeightFlightLevel";
import { latLngCodec } from "./LatLng";

export const pZoneCodec = Codec.struct({
  name: Codec.string,
  geometry: Codec.array(latLngCodec),
  lowerLimit: altitudeHeightFlightLevelSum,
  higherLimit: altitudeHeightFlightLevelSum,
  remarks: optionFromNullable(t.string) as Codec.Codec<
    any,
    unknown,
    Option<string>
  >,
});

export type PZone = Codec.TypeOf<typeof pZoneCodec>;
