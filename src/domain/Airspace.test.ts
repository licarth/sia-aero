import { iso } from "newtype-ts";
import { Latitude, Longitude } from ".";
import { Airspace } from "./Airspace";
import { AirspaceClass } from "./AirspaceClass";
import { AirspaceType } from "./AirspaceType";
import { Altitude, Height } from "./AltitudeHeightFlightLevel";

describe("Ctr.boundingBox()", () => {
  it("should return correct bounds", () => {
    const latMin = iso<Latitude>().wrap(43);
    const latMax = iso<Latitude>().wrap(44);
    const lngMin = iso<Longitude>().wrap(0);
    const lngMax = iso<Longitude>().wrap(1);
    const airspace: Airspace = {
      geometry: [
        { lat: latMin, lng: lngMin },
        { lat: latMax, lng: lngMax },
        { lat: latMax, lng: lngMax },
      ],
      name: "ctrName",
      lowerLimit: new Height(0),
      higherLimit: new Altitude(1000),
      airspaceClass: AirspaceClass.D,
      type: AirspaceType.CTR,
    };

    expect(Airspace.boundingBox(airspace)).toEqual([
      [latMin, lngMin],
      [latMax, lngMin],
      [latMax, lngMax],
      [latMin, lngMax],
    ]);
  });
});
