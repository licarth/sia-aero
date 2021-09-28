import * as Either from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { iso } from "newtype-ts";
import { VhfRadioFrequency } from ".";
import { vhfRadioFrequencyCodec } from "./VhfRadioFrequency";
describe("VhfRadioFrequency", () => {
  it("should return error if not a number", () => {
    expect(
      Either.isLeft(pipe("NotAnNumber", vhfRadioFrequencyCodec.decode)),
    ).toBeTruthy();
  });
  it("should return error if not a multiple of 5kHz", () => {
    expect(
      Either.isLeft(pipe("121.502", vhfRadioFrequencyCodec.decode)),
    ).toBeTruthy();
  });

  it("should succeed with emergency frequency 121.5", () => {
    expect(pipe(121.5, vhfRadioFrequencyCodec.decode)).toEqual(
      Either.right(iso<VhfRadioFrequency>().wrap("121.500")),
    );
  });
  it("should succeed with emergency frequency '121.5' as a string", () => {
    expect(pipe("121.5", vhfRadioFrequencyCodec.decode)).toEqual(
      Either.right(iso<VhfRadioFrequency>().wrap("121.500")),
    );
  });
  it("should succeed with emergency frequency 121.500", () => {
    expect(pipe(121.5, vhfRadioFrequencyCodec.decode)).toEqual(
      Either.right(iso<VhfRadioFrequency>().wrap("121.500")),
    );
  });
  it("should succeed with emergency frequency 121.505", () => {
    expect(pipe(121.505, vhfRadioFrequencyCodec.decode)).toEqual(
      Either.right(iso<VhfRadioFrequency>().wrap("121.505")),
    );
  });
});
