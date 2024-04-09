/// <reference path="../../definitions/geojson.d.ts" />

import { IMapLocation } from './Map';

// eslint-disable-next-line no-undef
export function convertItemToGeoJSONPoint(data: IMapLocation): GeoJSON.Feature {
    return {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [parseFloat(data.gps_lng), parseFloat(data.gps_lat)],
        },
        properties: { id: data.id },
    };
}
