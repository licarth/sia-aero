import { fromEnumCodec } from "../iots/enum";

export enum AirspaceClass {
  A = "A",
  B = "B",
  C = "C",
  D = "D",
  E = "E",
  F = "F",
  G = "G",
}

export const airspaceClassCodec = fromEnumCodec("AirspaceClass", AirspaceClass);
