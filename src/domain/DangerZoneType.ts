import { fromEnumCodec } from "../iots/enum";

export enum DangerZoneType {
  P = "P",
  R = "R",
  D = "D",
}

export const dangerZoneTypeCodec = fromEnumCodec("DangerZoneType", DangerZoneType);
