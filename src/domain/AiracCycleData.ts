import * as Codec from "io-ts/lib/Codec";
import { aerodromeCodec } from "./Aerodrome";
import { airspaceCodec } from "./Airspace";
import { DangerZone } from "./DangerZone";
import { obstacleCodec } from "./Obstacle";
import { VfrPoint } from "./VfrPoint";
import { Vor } from "./Vor";
import { Cycle } from "airac-cc";
import { pipe } from "fp-ts/lib/function";
import { success } from "io-ts/lib/Decoder";

export type AiracCycleData = Codec.TypeOf<typeof airacCycleCodec>;

const cycleCodec: Codec.Codec<unknown, string, Cycle> = pipe(
  Codec.string,
  Codec.compose(
    Codec.make(
      {
        decode: (input: string) => {
          return success(Cycle.fromIdentifier(input));
        },
      },
      {
        encode: (input: Cycle) => input.identifier,
      }
    )
  )
);

export const airacCycleCodec = Codec.struct({
  aerodromes: Codec.array(aerodromeCodec),
  obstacles: Codec.array(obstacleCodec),
  vfrPoints: Codec.array(VfrPoint.codec),
  airspaces: Codec.array(airspaceCodec),
  dangerZones: Codec.array(DangerZone.codec),
  vors: Codec.array(Vor.codec),
  cycle: cycleCodec,
});
