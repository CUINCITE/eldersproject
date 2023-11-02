/* eslint-disable max-len */
import mapboxgl from 'mapbox-gl';

import { Component } from './Component';
import { local } from '../Site';

export const token = local ? 'pk.eyJ1IjoibWlrb2xhai1odW5jd290IiwiYSI6ImNram1wNWZodDZlOHcyc2xnYmF0ODlpeXcifQ.svOUXdAo7D73Wloj7laAUA'
    : 'pk.eyJ1IjoibWlrb2xhai1odW5jd290IiwiYSI6ImNram1wNWZodDZlOHcyc2xnYmF0ODlpeXcifQ.svOUXdAo7D73Wloj7laAUA';

export interface IMapSettings {
    lat: number;
    lng: number;
    zoom?: number;
    style?: mapboxgl.Style | string;
    scroll?: boolean;
    token?: string;
    renderWorldCopies?: boolean;
    interactive?: boolean;
}


export class Map extends Component {

    private map: mapboxgl.Map;
    private settings: IMapSettings;


    constructor(protected view: HTMLElement) {
        super(view);

        this.settings = {
            lng: 20,
            lat: 30,
            zoom: 1,
            interactive: true,
            renderWorldCopies: true,
            style: 'mapbox://styles/mikolaj-huncwot/cl42ptcdy003114n04snldcng',
            token,
        };

        this.settings = Object.assign(this.settings, JSON.parse(this.view.getAttribute('options')));

        this.init();
    }



    private init = (): Promise<void> => new Promise(resolveAll => {
        mapboxgl.accessToken = this.settings.token;
        this.map = new mapboxgl.Map({
            container: this.view,
            style: this.settings.style,
            center: [this.settings.lng, this.settings.lat],
            zoom: this.settings.zoom,
            renderWorldCopies: this.settings.renderWorldCopies,
            interactive: this.settings.interactive,
            dragRotate: false,
            touchZoomRotate: false,
        });

        const mapPromise = new Promise<void>(resolve => {
            this.map.on('load', resolve);
        });

        const dataPromise = new Promise<void>((resolve, reject) => {
            try {
                resolve();
            } catch (err) {
                reject(err);
                throw new Error(err);
            }
        });


        Promise.all([mapPromise, dataPromise]).then(() => {
            resolveAll();
            this.onLoad();
        });
    });


    private onLoad = async() => {

    };
}
