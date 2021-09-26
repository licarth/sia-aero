import { pipe } from "fp-ts/lib/function";
import KDBush from "kdbush";
import _, { Dictionary } from "lodash";
import { iso } from "newtype-ts";
import { Aerodrome, IcaoCode, Latitude, Longitude } from "../domain";
import { airacCycleCodec, AiracCycleData } from "../domain/AiracCycleData";
import { Obstacle } from "../domain/Obstacle";
import { VfrPoint } from "../domain/VfrPoint";
import { getOrThrowDecodeError } from "../either";
import { AiracCycle } from "./AiracCycle";

export class AiracData {
  private _airacCycleData: AiracCycleData;
  private _airportsTree: KDBush<Aerodrome>;
  private _obstaclesTree: KDBush<Obstacle>;
  private _vfrPointsTree: KDBush<VfrPoint>;
  private _aerodromesPerIcaoCode: Dictionary<Aerodrome>;

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
    this._vfrPointsTree = new KDBush(
      this.vfrPoints,
      (o) => iso<Longitude>().unwrap(o.latLng.lng),
      (o) => iso<Latitude>().unwrap(o.latLng.lat),
    );
    this._aerodromesPerIcaoCode = _.keyBy(this.aerodromes, "icaoCode");
  }

  get aerodromes(): Aerodrome[] {
    return this._airacCycleData.aerodromes;
  }

  get obstacles(): Obstacle[] {
    return this._airacCycleData.obstacles;
  }

  get vfrPoints(): VfrPoint[] {
    return this._airacCycleData.vfrPoints;
  }

  static loadCycle(airacCycle?: AiracCycle): AiracData {
    return pipe(
      airacCycleCodec.decode(airacCycle),
      getOrThrowDecodeError,
      (airacCycleData) => new AiracData({ airacCycleData }),
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

  getVfrPointsInBbox(minX: number, minY: number, maxX: number, maxY: number) {
    return this._vfrPointsTree
      .range(minX, minY, maxX, maxY)
      .map((i) => this._airacCycleData.vfrPoints[i]);
  }

  getAerodromeByIcaoCode(icaoCode: IcaoCode | string) {
    return this._aerodromesPerIcaoCode[`${icaoCode}`];
  }
}
