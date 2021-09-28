import * as Codec from "io-ts/lib/Codec";
import { aerodromeCodec } from "./Aerodrome";
import { ctrCodec } from "./Ctr";
import { obstacleCodec } from "./Obstacle";
import { vfrPointCodec } from "./VfrPoint";

export const airacCycleCodec = Codec.struct({
  aerodromes: Codec.array(aerodromeCodec),
  obstacles: Codec.array(obstacleCodec),
  vfrPoints: Codec.array(vfrPointCodec),
  ctr: Codec.array(ctrCodec),
});

export type AiracCycleData = Codec.TypeOf<typeof airacCycleCodec>;
