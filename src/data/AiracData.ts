import { pipe } from "fp-ts/lib/function";
import KDBush from "kdbush";
import _, { Dictionary } from "lodash";
import { iso } from "newtype-ts";
import RBush from "rbush";
import { Aerodrome, IcaoCode, Latitude, Longitude } from "../domain";
import { airacCycleCodec, AiracCycleData } from "../domain/AiracCycleData";
import { Airspace } from "../domain/Airspace";
import { DangerZone } from "../domain/DangerZone";
import { Obstacle } from "../domain/Obstacle";
import { VfrPoint } from "../domain/VfrPoint";
import { Vor } from "../domain/Vor";
import { getOrThrowDecodeError } from "../either";
import { Cycle } from "airac-cc";
import { localTimeService, TimeService } from "../TimeService";
import { format } from "date-fns";
import pointInPolygon from "@turf/boolean-point-in-polygon";
import { point, polygon } from "@turf/helpers";

type Attributes = {
  minX: Longitude;
  minY: Latitude;
  maxX: Longitude;
  maxY: Latitude;
};

const FORMAT = "yyyy-MM-dd";

export class AiracData {
  private _airacCycleData: AiracCycleData;
  private _airportsTree: KDBush<Aerodrome>;
  private _obstaclesTree: KDBush<Obstacle>;
  private _vfrPointsTree: KDBush<VfrPoint>;
  private _vorsTree: KDBush<Vor>;
  private _airspacesTree: RBush<Attributes & { airspace: Airspace }>;
  private _dangerZonesTree: RBush<Attributes & { dangerZone: DangerZone }>;
  private _aerodromesPerIcaoCode: Dictionary<Aerodrome>;

  constructor({ airacCycleData }: { airacCycleData: AiracCycleData }) {
    this._airacCycleData = airacCycleData;

    this._airportsTree = new KDBush(
      this.aerodromes,
      (a) => iso<Longitude>().unwrap(a.latLng.lng),
      (a) => iso<Latitude>().unwrap(a.latLng.lat)
    );
    this._obstaclesTree = new KDBush(
      this.obstacles,
      (o) => iso<Longitude>().unwrap(o.latLng.lng),
      (o) => iso<Latitude>().unwrap(o.latLng.lat)
    );
    this._vfrPointsTree = new KDBush(
      this.vfrPoints,
      (o) => iso<Longitude>().unwrap(o.latLng.lng),
      (o) => iso<Latitude>().unwrap(o.latLng.lat)
    );
    this._vorsTree = new KDBush(
      this.vors,
      (o) => iso<Longitude>().unwrap(o.latLng.lng),
      (o) => iso<Latitude>().unwrap(o.latLng.lat)
    );
    this._airspacesTree = new RBush();
    this._airspacesTree.load(
      _.flatMap(
        this.airspaces.map((airspace) => {
          const bbox = Airspace.boundingBox(airspace);
          return {
            airspace,
            minX: bbox[0][1],
            minY: bbox[0][0],
            maxX: bbox[2][1],
            maxY: bbox[2][0],
          };
        })
      )
    );
    this._dangerZonesTree = new RBush();
    this._dangerZonesTree.load(
      _.flatMap(
        this.dangerZones.map((dangerZone) => {
          const bbox = Airspace.boundingBox(dangerZone);
          return {
            dangerZone,
            minX: bbox[0][1],
            minY: bbox[0][0],
            maxX: bbox[2][1],
            maxY: bbox[2][0],
          };
        })
      )
    );
    this._aerodromesPerIcaoCode = _.keyBy(this.aerodromes, "icaoCode");
  }

  get cycle(): Cycle {
    return this._airacCycleData.cycle;
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

  get vors(): Vor[] {
    return this._airacCycleData.vors;
  }

  get airspaces(): Airspace[] {
    return this._airacCycleData.airspaces;
  }

  get dangerZones(): DangerZone[] {
    return this._airacCycleData.dangerZones;
  }

  static async loadCycle(cycleData: object | string): Promise<AiracData> {
    return pipe(
      airacCycleCodec.decode(cycleData),
      getOrThrowDecodeError,
      (airacCycleData) => new AiracData({ airacCycleData })
    );
  }

  static currentCycleDate(timeService: TimeService = localTimeService) {
    const newVariable = format(
      Cycle.fromDate(timeService.now()).effectiveStart,
      FORMAT
    );
    console.log(newVariable);
    return newVariable;
  }

  getAerodromesInBbox(minX: number, minY: number, maxX: number, maxY: number) {
    return this._airportsTree
      .range(minX, minY, maxX, maxY)
      .map((i) => this._airacCycleData.aerodromes[i]);
  }

  getVorsInBbox(minX: number, minY: number, maxX: number, maxY: number) {
    return this._vorsTree
      .range(minX, minY, maxX, maxY)
      .map((i) => this._airacCycleData.vors[i]);
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

  getFixturesWithinRange(x: number, y: number, rangeInMeters: number) {
    return [
      ...this._vfrPointsTree
        .within(x, y, rangeInMeters)
        .map((i) => this._airacCycleData.vfrPoints[i]),
      ...this._airportsTree
        .within(x, y, rangeInMeters)
        .map((i) => this._airacCycleData.aerodromes[i]),
      ...this._vorsTree
        .within(x, y, rangeInMeters)
        .map((i) => this._airacCycleData.vors[i]),
    ];
  }

  getAirspacesInBbox(
    minX: number,
    minY: number,
    maxX: number,
    maxY: number
  ): Airspace[] {
    return this._airspacesTree
      .search({ minX, minY, maxX, maxY })
      .map(({ airspace }) => airspace);
  }

  getAirspacesIntersecting(lat: number, lng: number): Airspace[] {
    return this._airspacesTree
      .search({ minX: lng, minY: lat, maxX: lng, maxY: lat })
      .map(({ airspace }) => airspace)
      .filter((airspace) => {
        return pointInPolygon(
          point([lng, lat]),
          polygon([
            airspace.geometry.map(({ lat, lng }) => [Number(lng), Number(lat)]),
          ])
        );
      });
  }

  getDangerZonesIntersecting(lat: number, lng: number): DangerZone[] {
    return this._dangerZonesTree
      .search({ minX: lng, minY: lat, maxX: lng, maxY: lat })
      .map(({ dangerZone }) => dangerZone)
      .filter((dangerZone) => {
        return pointInPolygon(
          point([lng, lat]),
          polygon([
            dangerZone.geometry.map(({ lat, lng }) => [
              Number(lng),
              Number(lat),
            ]),
          ])
        );
      });
  }

  getDangerZonesInBbox(
    minX: number,
    minY: number,
    maxX: number,
    maxY: number
  ): DangerZone[] {
    return this._dangerZonesTree
      .search({ minX, minY, maxX, maxY })
      .map(({ dangerZone }) => dangerZone);
  }

  getAerodromeByIcaoCode(icaoCode: IcaoCode | string) {
    return this._aerodromesPerIcaoCode[`${icaoCode}`];
  }
}
