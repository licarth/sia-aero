import { AirspaceType } from "../domain";
import { AiracCycles } from "./AiracCycle";
import { AiracData } from "./AiracData";

describe("AiracData", () => {
  it("There should be 8 airfields in Corsica", () => {
    const cycle = AiracData.loadCycle(AiracCycles.SEP_08_2022);
    expect(cycle.getAerodromesInBbox(8.5, 41.5, 9.5, 43)).toHaveLength(8);
  });
  it("loadCycle should get LFMT", () => {
    const cycle = AiracData.loadCycle(AiracCycles.SEP_08_2022);

    expect(cycle.getAerodromeByIcaoCode("LFMT").mapShortName).toEqual(
      "MONTPELLIER M."
    );
  });

  it("loadCycle should get 4 Ctrs in Corsica", () => {
    const cycle = AiracData.loadCycle(AiracCycles.SEP_08_2022);
    const names = cycle
      .getAirspacesInBbox(8.5, 41.5, 9.5, 43)
      .filter(({ type }) => type === AirspaceType.CTR)
      .map(({ name }) => name);
    expect(names).toHaveLength(4);
    expect(names).toContainEqual("CTR AJACCIO");
    expect(names).toContainEqual("CTR BASTIA");
    expect(names).toContainEqual("CTR FIGARI");
    expect(names).toContainEqual("CTR CALVI");
  });
});
