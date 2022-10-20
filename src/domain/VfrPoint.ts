import { pipe } from "fp-ts/lib/function";
import * as Codec from "io-ts/lib/Codec";
import { icaoCodeCodec } from "./IcaoCode";
import { fromClassCodec } from "./io-ts/fromClassCodec";
import { latLngCodec } from "./LatLng";

export type VfrPointProps = Codec.TypeOf<typeof VfrPoint.propsCodec>;

export class VfrPoint {
  icaoCode;
  name;
  description;
  latLng;

  constructor(props: VfrPointProps) {
    this.icaoCode = props.icaoCode;
    this.name = props.name;
    this.description = props.description;
    this.latLng = props.latLng;
  }

  get id() {
    return `${this.icaoCode}/${this.name}`;
  }

  static propsCodec = Codec.struct({
    icaoCode: icaoCodeCodec,
    name: Codec.string,
    description: Codec.nullable(Codec.string),
    latLng: latLngCodec,
  });

  static codec = pipe(
    VfrPoint.propsCodec,
    Codec.compose(fromClassCodec(VfrPoint))
  );
}
