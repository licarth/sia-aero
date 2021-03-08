import * as Either from "fp-ts/lib/Either";
import * as Decoder from "io-ts/lib/Decoder";
import { pipe } from "fp-ts/lib/function";
import { latLngCodec } from "./LatLng";

describe("LatLng", () => {
  it("should return an error when lat is out of bounds", () => {
    expect(
      Either.isLeft(pipe({ lat: 100, lng: 0 }, latLngCodec.decode)),
    ).toBeTruthy();
  });
  it("should return an error when lng is out of bounds", () => {
    expect(
      Either.isLeft(pipe({ lat: 0, lng: 181 }, latLngCodec.decode)),
    ).toBeTruthy();
  });
});
