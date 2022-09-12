import * as Either from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { VorRadioFrequency } from "./VorRadioFrequency";

describe("VorRadioFrequency", () => {
  it("should succeed with frequency 108.000", () => {
    expect(pipe("108.0", VorRadioFrequency.xmlCodec.decode)).toEqual(
      Either.right(VorRadioFrequency.factory({ kHzValue: 108000 }))
    );
  });
  it("should succeed with frequency 108.000", () => {
    expect(pipe(108.0, VorRadioFrequency.xmlCodec.decode)).toEqual(
      Either.right(VorRadioFrequency.factory({ kHzValue: 108000 }))
    );
  });
  it("should succeed with frequency 108.000", () => {
    expect(pipe(108, VorRadioFrequency.xmlCodec.decode)).toEqual(
      Either.right(VorRadioFrequency.factory({ kHzValue: 108000 }))
    );
  });
});
