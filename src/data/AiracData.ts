import * as Either from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { DecodeError } from "io-ts/lib/Decoder";
import KDBush from "kdbush";
import { iso } from "newtype-ts";
import { Aerodrome, Latitude, Longitude } from "../domain";
import { airacCycleCodec, AiracCycleData } from "../domain/AiracCycleData";
import { Obstacle } from "../domain/Obstacle";
import { AiracCycle } from "./AiracCycle";

export class AiracData {
  private _airacCycleData: AiracCycleData;
  private _airportsTree: KDBush<Aerodrome>;
  private _obstaclesTree: KDBush<Obstacle>;

  constructor({ airacCycleData }: { airacCycleData: AiracCycleData }) {
    this._airacCycleData = airacCycleData;

    this._airportsTree = new KDBush(
      this.aerodromes,
      (a) => iso<Longitude>().unwrap(a.latLng.lng),
      (a) => iso<Latitude>().unwrap(a.latLng.lat),
    );
    this._obstaclesTree = new KDBush(
      this.obstacles,
      (o) => iso<Longitude>().unwrap(o.latLng.lng),
      (o) => iso<Latitude>().unwrap(o.latLng.lat),
    );
  }

  get aerodromes(): Aerodrome[] {
    return this._airacCycleData.aerodromes;
  }

  get obstacles(): Obstacle[] {
    return this._airacCycleData.obstacles;
  }

  static loadCycle(
    airacCycle?: AiracCycle,
  ): Either.Either<DecodeError, AiracData> {
    return pipe(
      airacCycleCodec.decode(airacCycle),
      Either.map(
        (airacCycleData) =>
          new AiracData({
            airacCycleData,
          }),
      ),
    );
  }

  getAerodromesInBbox(minX: number, minY: number, maxX: number, maxY: number) {
    return this._airportsTree
      .range(minX, minY, maxX, maxY)
      .map((i) => this._airacCycleData.aerodromes[i]);
  }
  
  getObstaclesInBbox(minX: number, minY: number, maxX: number, maxY: number) {
    return this._obstaclesTree
      .range(minX, minY, maxX, maxY)
      .map((i) => this._airacCycleData.obstacles[i]);
  }
}
