import { Cycle } from "airac-cc";
import { AirspaceType } from "../domain";
import { AiracData } from "./AiracData";

describe("AiracData", () => {
  it("There should be 8 airfields in Corsica", async () => {
    const cycle = await loadCycle();
    expect(cycle.getAerodromesInBbox(8.5, 41.5, 9.5, 43)).toHaveLength(8);
  });
  it("loadCycle should get LFMT", async () => {
    const cycle = await loadCycle();

    expect(cycle.getAerodromeByIcaoCode("LFMT").mapShortName).toEqual(
      "MONTPELLIER M."
    );
  });

  it("cycle information should include Airac Cycle Date", async () => {
    console.log(AiracData.currentCycleDate());
    const cycle = await loadCycle();
    expect(cycle.cycle.effectiveStart).toEqual(new Date("2023-03-23"));
  });

  it("should return correct start date", async () => {
    expect(Cycle.fromDate(new Date("2023-03-23")).effectiveStart).toEqual(
      new Date("2023-03-23")
    );
  });

  it("loadCycle should get 4 Ctrs in Corsica", async () => {
    const cycle = await loadCycle();
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

async function loadCycle() {
  return AiracData.loadCycle(
    await import(`../jsonData/${AiracData.currentCycleDate()}.json`)
  );
}
