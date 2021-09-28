import { iso } from "newtype-ts";
import { Latitude, Longitude } from ".";
import { Ctr } from "./Ctr";


export namespace Airspace {
  export const boundingBox = (
    ctr: Ctr
  ): [
      [Latitude, Longitude],
      [Latitude, Longitude],
      [Latitude, Longitude],
      [Latitude, Longitude]
    ] => {
    const lats: number[] = [];
    const lngs: number[] = [];

    for (let i = 0; i < ctr.geometry.length; i++) {
      lats.push(Latitude.getValue(ctr.geometry[i].lat));
      lngs.push(Longitude.getValue(ctr.geometry[i].lng));
    }

    // calc the min and max lng and lat
    const minlat = iso<Latitude>().wrap(Math.min(...lats));
    const maxlat = iso<Latitude>().wrap(Math.max(...lats));
    const minlng = iso<Longitude>().wrap(Math.min(...lngs));
    const maxlng = iso<Longitude>().wrap(Math.max(...lngs));

    // create a bounding rectangle that can be used in leaflet
    const bbox: [
      [Latitude, Longitude],
      [Latitude, Longitude],
      [Latitude, Longitude],
      [Latitude, Longitude]
    ] = [
        [minlat, minlng],
        [maxlat, minlng],
        [maxlat, maxlng],
        [minlat, maxlng],
      ];

    // console.log(`geom : ${JSON.stringify(ctr.geometry)}`);
    // console.log(`bbox: ${JSON.stringify(bbox)}`);
    // add the bounding box to the map, and set the map extent to it
    return bbox;
  };
}
