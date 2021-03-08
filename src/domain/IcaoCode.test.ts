import * as Either from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { icaoCodeCodec } from "./IcaoCode";

describe("IcaoCode", () => {
  it("should return an error when not a 4 letter code", () => {
    expect(
      Either.isLeft(pipe("NotAnIcaoCode", icaoCodeCodec.decode)),
    ).toBeTruthy();
  });
  it("should return an error when not a 4 letter code", () => {
    expect(pipe("LFPO", icaoCodeCodec.decode)).toEqual(Either.right("LFPO"));
  });
});
