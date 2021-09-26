import * as Either from "fp-ts/lib/Either";
import { DecodeError, draw } from "io-ts/lib/Decoder";

export const getOrThrowError = <A, E extends Error>(
  either: Either.Either<E, A>,
): A => {
  if (Either.isLeft(either)) {
    throw either.left;
  } else return either.right;
};

export const getOrThrowDecodeError = <A, E extends DecodeError>(
  either: Either.Either<E, A>,
): A => {
  if (Either.isLeft(either)) {
    throw new Error(`DecodeError: \n${draw(either.left)}`);
  } else return either.right;
};
