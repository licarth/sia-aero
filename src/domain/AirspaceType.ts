import { fromEnumCodec } from "../iots/enum";

export enum AirspaceType {
  TMA = "TMA",
  CTR = "CTR",
  CTA = "CTA",
  SIV = "SIV",
}

export const airspaceTypeCodec = fromEnumCodec("AirspaceType", AirspaceType);
