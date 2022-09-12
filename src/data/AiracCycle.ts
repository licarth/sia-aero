import AUG_11_2022_JSON from "../jsonData/2022-08-11.json";
import SEP_08_2022_JSON from "../jsonData/2022-09-08.json";
import { Opaque } from "./Opaque";

export type AiracCycle = Opaque<"AiracCycle", any>;

export namespace AiracCycles {
  export const AUG_11_2022: AiracCycle = AUG_11_2022_JSON;
  export const SEP_08_2022: AiracCycle = SEP_08_2022_JSON;
}
