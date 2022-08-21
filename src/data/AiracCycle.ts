import NOV_04_2021_JSON from "../jsonData/2021-11-04.json";
import AUG_11_2022_JSON from "../jsonData/2022-08-11.json";
import { Opaque } from "./Opaque";

export type AiracCycle = Opaque<"AiracCycle", any>;

export namespace AiracCycles {
  export const NOV_04_2021: AiracCycle = NOV_04_2021_JSON;
  export const AUG_11_2022: AiracCycle = AUG_11_2022_JSON;
}
