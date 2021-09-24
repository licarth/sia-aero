import * as Either from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { draw } from "io-ts/lib/Decoder";
import { iso } from "newtype-ts";
import { IcaoCode } from "../domain";
import { AiracCycles } from "./AiracCycle";
import { AiracData } from "./AiracData";

describe("AiracData", () => {
  it("loadCycle should load airports", () => {
    const cycle = pipe(
      AiracData.loadCycle(AiracCycles.MARCH_25_2021),
      Either.fold(
        (e) => {
          console.log(draw(e));
          return null;
        },
        (a) => a,
      ),
    );

    console.log(cycle.getAerodromesInBbox(9, -90, 10, 90));
  });
  it("loadCycle should get LFMT", () => {
    const cycle = pipe(
      AiracData.loadCycle(AiracCycles.MARCH_25_2021),
      Either.fold(
        (e) => {
          console.log(draw(e));
          return null;
        },
        (a) => a,
      ),
    );

    console.log(cycle.getAerodromeByIcaoCode(iso<IcaoCode>().wrap("LFMT")));
  });
});
