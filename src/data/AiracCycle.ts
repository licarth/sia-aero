import MARCH_25_2021_JSON from "../jsonData/2021_03_25/aerodromes.json";
import { Opaque } from "./Opaque";

export type AiracCycle = Opaque<"AiracCucle", any>;


export namespace AiracCycles {
  export const MARCH_25_2021: AiracCycle = MARCH_25_2021_JSON;
}
