import { AiracCycles } from "./AiracCycle";
import { AiracData } from "./AiracData";

describe("AiracData", () => {
  it("There should be 7 airfields in Corsica", () => {
    const cycle = AiracData.loadCycle(AiracCycles.NOV_04_2021);
    expect(cycle.getAerodromesInBbox(8.5, 41.5, 9.5, 43)).toHaveLength(7);
  });
  it("loadCycle should get LFMT", () => {
    const cycle = AiracData.loadCycle(AiracCycles.NOV_04_2021);

    expect(cycle.getAerodromeByIcaoCode("LFMT").mapShortName).toEqual(
      "MONTPELLIER M.",
    );
  });
});
