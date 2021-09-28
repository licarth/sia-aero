import { pipe } from "fp-ts/lib/function";
import * as Codec from "io-ts/lib/Codec";
import * as Decoder from "io-ts/lib/Decoder";

export class Altitude {
  feetValue: number;

  constructor(feetValue: number) {
    this.feetValue = feetValue;
  }

  toString() {
    return `${this.feetValue} ft. AMSL`;
  }
}

export class Height {
  feetValue: number;

  constructor(feetValue: number) {
    this.feetValue = feetValue;
  }

  toString() {
    return `${this.feetValue} ft. ASFC`;
  }
}

export class FlightLevel {
  levelInFeet: number;

  constructor({ levelInFeet }: { levelInFeet: number }) {
    this.levelInFeet = levelInFeet;
  }

  toString() {
    return `FL${String(Math.trunc(this.levelInFeet / 100)).padStart(3, "0")}`;
  }
}

export const heightCodec = Codec.make(
  pipe(
    Decoder.string,
    Decoder.compose({
      decode: (altString: string) => {
        const m = altString.match(/^(([0-9]| )*)( )?(ft)?(.)?( )?(SFC|ASFC|AGL)$/);
        return m
          ? Decoder.success(new Height(Number(m[1].replace(/ /g, ""))))
          : Decoder.failure(altString, "a valid Height");
      },
    }),
  ),
  { encode: (f: Height) => f.toString() },
);

export const altitudeCodec = Codec.make(
  pipe(
    Decoder.string,
    Decoder.compose({
      decode: (altString: string) => {
        const m = altString.match(/^(([0-9]| )*)( )?(ft)?(.)?( )?(AMSL|)$/);
        return m
          ? Decoder.success(new Altitude(Number(m[1].replace(/ /g, ""))))
          : Decoder.failure(altString, "a valid Altitude");
      },
    }),
  ),
  { encode: (f: Altitude) => f.toString() },
);

export const flightLevelCodec = Codec.make(
  pipe(
    Decoder.string,
    Decoder.compose({
      decode: (flString: string) => {
        const m = flString.match(
          /^(?:FL(?:\.)?(?: )*((?:[0-9]| )*)(?: )*|(?: )*((?:[0-9]| )*)FL(?:\.)?(?: )*)$/,
        );
        return m
          ? Decoder.success(
              new FlightLevel({
                levelInFeet: Number(m[1] || m[2]) * 100,
              }),
            )
          : Decoder.failure(flString, "a valid Flight Level");
      },
    }),
  ),
  { encode: (f: FlightLevel) => f.toString() },
);

export const altitudeHeightFlightLevelSum = Codec.make(
  Decoder.union(flightLevelCodec, altitudeCodec, heightCodec),
  { encode: (o) => o.toString() },
);
