import { none } from "fp-ts/lib/Option";
import {
  AUTOINFO,
  Frequencies
} from "./domain";
import { Aerodrome } from "./domain/Aerodrome";

export const addAutoInfoWhenNoOtherFrequency = (a: Aerodrome): Aerodrome => {
  if (a.frequencies.autoinfo.length === 0 &&
    a.frequencies.afis.length === 0 &&
    a.frequencies.tower.length === 0) {
    const frequencies: Frequencies = {
      ...a.frequencies,
      autoinfo: [{ frequency: AUTOINFO, remarks: none }],
    };
    return { ...a, frequencies };
  }
  return a;
};
