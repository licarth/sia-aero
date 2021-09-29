import { right } from "fp-ts/lib/Either";
import {
  Altitude,
  altitudeHeightFlightLevelSum,
  FlightLevel,
  flightLevelCodec,
  Height
} from "./AltitudeHeightFlightLevel";

describe("FlightLevel.toString()", () => {
  it("should properly write FL100", () => {
    expect(new FlightLevel({ levelInFeet: 10000 }).toString()).toEqual("FL100");
  });
  it("should properly write FL090", () => {
    expect(new FlightLevel({ levelInFeet: 9000 }).toString()).toEqual("FL090");
  });
  it("should properly write FL045", () => {
    expect(new FlightLevel({ levelInFeet: 4500 }).toString()).toEqual("FL045");
  });
  it("should properly write FL001", () => {
    expect(new FlightLevel({ levelInFeet: 100 }).toString()).toEqual("FL001");
  });
});

describe("flightLevelCodec", () => {
  it("should properly encode Flight Level", () => {
    expect(
      flightLevelCodec.encode(new FlightLevel({ levelInFeet: 10000 })),
    ).toEqual("FL100");
  });
  it("should properly decode Flight Level", () => {
    expect(flightLevelCodec.decode("FL090")).toEqual(
      right(new FlightLevel({ levelInFeet: 9000 })),
    );
  });
});

describe("altitudeHeightFlightLevelSum", () => {
  it("should encode Flight Level", () => {
    expect(
      flightLevelCodec.encode(new FlightLevel({ levelInFeet: 10000 })),
    ).toEqual("FL100");
  });
  it("should decode Flight Level", () => {
    expect(altitudeHeightFlightLevelSum.decode("FL090")).toEqual(
      right(new FlightLevel({ levelInFeet: 9000 })),
    );
  });
  it("should decode 9000 ft. AMSL", () => {
    expect(altitudeHeightFlightLevelSum.decode("9000 ft. AMSL")).toEqual(
      right(new Altitude(9000)),
    );
  });
  it("should decode 9000ft. AMSL", () => {
    expect(altitudeHeightFlightLevelSum.decode("9000ft. AMSL")).toEqual(
      right(new Altitude(9000)),
    );
  });
  it("should decode 9000 AMSL", () => {
    expect(altitudeHeightFlightLevelSum.decode("9000 AMSL")).toEqual(
      right(new Altitude(9000)),
    );
  });
  it("should decode 9 0 0 0 AMSL", () => {
    expect(altitudeHeightFlightLevelSum.decode("9 0 0 0 ft. AMSL")).toEqual(
      right(new Altitude(9000)),
    );
  });
  it("should decode 9000 ft. ASFC", () => {
    expect(altitudeHeightFlightLevelSum.decode("9000 ft. ASFC")).toEqual(
      right(new Height(9000)),
    );
  });
  it("should decode 9000 ft. SFC", () => {
    expect(altitudeHeightFlightLevelSum.decode("9000 ft. SFC")).toEqual(
      right(new Height(9000)),
    );
  });
  it("should default to Altitude (AMSL)", () => {
    expect(altitudeHeightFlightLevelSum.decode("9000")).toEqual(
      right(new Altitude(9000)),
    );
  });
  it("should decode 090 FL.", () => {
    expect(altitudeHeightFlightLevelSum.decode("090 FL.")).toEqual(
      right(new FlightLevel({ levelInFeet: 9000 })),
    );
  });
  it("should decode FL.090", () => {
    expect(altitudeHeightFlightLevelSum.decode("FL.090")).toEqual(
      right(new FlightLevel({ levelInFeet: 9000 })),
    );
  });
  it("should decode SFC", () => {
    expect(altitudeHeightFlightLevelSum.decode("SFC")).toEqual(
      right(new Height(0)),
    );
  });
});
