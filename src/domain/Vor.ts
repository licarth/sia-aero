import { pipe } from "fp-ts/lib/function";
import * as Codec from "io-ts/lib/Codec";
import { altitudeInFeetCodec } from "./AltitudeInFeet";
import { fromClassCodec } from "./io-ts/fromClassCodec";
import { optional } from "./io-ts/optional";
import { latLngCodec } from "./LatLng";
import { VorRadioFrequency } from "./VorRadioFrequency";

export type VorProps = Codec.TypeOf<typeof Vor.propsCodec>;

export class Vor {
  ident;
  mapShortName;
  name;
  dme;
  latLng;
  frequency;
  coverage;
  rangeInNm;
  altitude;

  constructor(props: VorProps) {
    this.name = props.name;
    this.ident = props.ident;
    this.mapShortName = props.mapShortName;
    this.dme = props.dme;
    this.latLng = props.latLng;
    this.frequency = props.frequency;
    this.coverage = props.coverage;
    this.rangeInNm = props.rangeInNm;
    this.altitude = props.altitude;
  }

  static propsCodec = Codec.struct({
    name: Codec.string,
    ident: Codec.string,
    mapShortName: Codec.string,
    dme: Codec.boolean,
    latLng: latLngCodec,
    frequency: VorRadioFrequency.codec,
    coverage: optional(Codec.string),
    rangeInNm: optional(Codec.number),
    altitude: optional(altitudeInFeetCodec),
  });

  static xmlCodec = Codec.struct({
    name: Codec.string,
    ident: Codec.string,
    mapShortName: Codec.string,
    dme: Codec.boolean,
    latLng: latLngCodec,
    frequency: VorRadioFrequency.xmlCodec,
    coverage: optional(Codec.string),
    rangeInNm: optional(Codec.number),
    altitude: optional(altitudeInFeetCodec),
  });

  static codec = pipe(Vor.propsCodec, Codec.compose(fromClassCodec(Vor)));
}
