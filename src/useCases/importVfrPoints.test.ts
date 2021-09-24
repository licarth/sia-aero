import { right } from "fp-ts/lib/Either";
import fs from "fs";
import path from "path";
import { LatLng } from "../domain";
import { importVfrPoints } from "./importVfrPoints";

describe("importVfrPoints", () => {
  it("should import from gpx properly", async () => {
    let gpxString = fs.readFileSync(path.join(__dirname, "gpxExample.xml"), {
      encoding: "utf8",
    });

    expect(await importVfrPoints(gpxString)).toEqual(
      right([
        {
          description: "Some comment A",
          icaoCode: "LFBA",
          latLng: {
            lat: 44.19280,
            lng: 0.64667,
          },
          name: "A",
        },
        {
          description: "Some comment B",
          icaoCode: "LFBA",
          latLng: {
            lat: 45.19280,
            lng: 0.64667,
          },
          name: "B",
        },
      ]),
    );
  });
});
