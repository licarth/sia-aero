import MAR_25_2021_JSON from "../jsonData/2021-03-25.json";
import NOV_04_2021_JSON from "../jsonData/2021-11-04.json";
import { Opaque } from "./Opaque";

export type AiracCycle = Opaque<"AiracCycle", any>;

export namespace AiracCycles {
  export const MAR_25_2021: AiracCycle = MAR_25_2021_JSON;
  export const NOV_04_2021: AiracCycle = NOV_04_2021_JSON;
}
