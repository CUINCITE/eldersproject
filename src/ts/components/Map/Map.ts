/// <reference path="../../definitions/geojson.d.ts" />

/* eslint-disable max-len */
import mapboxgl from 'mapbox-gl';
import { gsap } from 'gsap/dist/gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { debounce } from '../../Utils';
import { Component } from '../Component';
import { breakpoint, easing, local } from '../../Site';
import { AudioPlayer } from '../AudioPlayer';
import * as MapUtils from './Map.utils';
import { mapStyles } from './Map.styles';

export const token = local ? 'pk.eyJ1IjoiaHVuY3dvdHkiLCJhIjoiY2lwcW04em50MDA1OWkxbnBldXVoMXFrdCJ9.kQro-nPHRoqP_XKLLsR3gA'
    : 'pk.eyJ1IjoiaHVuY3dvdHkiLCJhIjoiY2lwcW04em50MDA1OWkxbnBldXVoMXFrdCJ9.kQro-nPHRoqP_XKLLsR3gA';

declare let ScrollToPlugin;
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export interface IMapSettings {
    lat: number;
    lng: number;
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    style?: mapboxgl.Style | string;
    scroll?: boolean;
    token?: string;
    renderWorldCopies?: boolean;
    interactive?: boolean;
    pitch?: number;
    clusterRadius?: number;
    clusterMaxZoom?: number;
    zoomOnScroll?: boolean;
    lazyLoading?: boolean;
}



export interface IMapInterview {
    title: string;
    duration: string;
    id: string;
    start: number;
}



export interface IMapLocation {
    id: string;
    label: string;
    address: string;
    gps_lat: string;
    gps_lng: string;
    quotes: IMapInterview[];
}



export class Map extends Component {

    private static SOURCE_NAME: string = 'markers';

    private markers: { [key: string]: mapboxgl.Marker } = {};
    private markersOnScreen: { [key: string]: mapboxgl.Marker } = {};
    private map: mapboxgl.Map;
    private settings: IMapSettings;
    private locationsElements: NodeListOf<HTMLElement>;
    private activeLocation: IMapLocation;
    private interviewsList: HTMLElement;
    private popup: mapboxgl.Popup;
    private contentInjected: boolean;
    private toggleButton: HTMLButtonElement;
    private isZoomingIn = false;
    private isGlobalView = true;
    private locations: IMapLocation[];
    private allFeatures: GeoJSON.Feature[];
    private geojson: mapboxgl.GeoJSONSourceRaw;
    private style: string;
    private scrolledContainer: HTMLElement;
    private isGlobalMap: boolean;
    private isRemovingItems = false;


    constructor(protected view: HTMLElement) {
        super(view);

        this.settings = {
            lng: -100,
            lat: 10,
            minZoom: 3.5,
            zoom: 10,
            maxZoom: 16,
            interactive: true,
            renderWorldCopies: true,
            style: 'mapbox://styles/huncwoty/clslo0jir001201pk16knfveh',
            token,
            pitch: 60,
            zoomOnScroll: false,
            clusterMaxZoom: 14,
            clusterRadius: 50,
            lazyLoading: false,
        };

        this.settings = Object.assign(this.settings, JSON.parse(this.view.getAttribute('data-options')));
        this.locationsElements = this.view.querySelectorAll('.js-location');
        this.interviewsList = this.view.querySelector('.js-interviews-list');
        this.contentInjected = false;
        this.toggleButton = this.view.querySelector('.js-toggle-button');
        this.locations = JSON.parse(this.view.getAttribute('data-locations')) as IMapLocation[];
        this.scrolledContainer = this.view.querySelector('.js-scrolled');
        this.isGlobalMap = this.view.classList.contains('map--global');

        // find style for given modifier (if exists)
        this.style = this.view.getAttribute('data-theme-color');

        this.settings.lazyLoading ? this.setScroll() : this.init();

        window.addEventListener('resize', debounce(() => breakpoint.phone && !this.contentInjected && this.getTabContent()));
    }



    private init = (): Promise<void> => new Promise(resolveAll => {
        mapboxgl.accessToken = this.settings.token;
        this.map = new mapboxgl.Map({
            container: this.view.querySelector('.js-map') as HTMLElement,
            style: this.settings.style,
            center: [this.settings.lng, this.settings.lat],
            zoom: this.settings.zoom,
            maxZoom: this.settings.maxZoom,
            minZoom: this.settings.minZoom,
            renderWorldCopies: this.settings.renderWorldCopies,
            interactive: this.settings.interactive,
            dragRotate: false,
            touchZoomRotate: false,
            pitch: this.settings.pitch,
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



    private setScroll = (): void => {
        ScrollTrigger.create({
            trigger: this.view,
            start: 'top 200%',
            once: true,
            end: 'bottom bottom',
            onEnter: () => this.init(),
        });
    };



    private onLoad = async() => {
        this.map.on('idle', this.onMapIdle);
        this.bind();
        breakpoint.phone && this.locationsElements.length && this.goToLocation(this.locations[0]);

        this.fitBounds(true);
        this.setFilters();
        this.style !== 'main' && this.updateColors();
    };


    private updateColors(): void {
        const camelCaseName = this.style.split('-').reduce((a, b) => a + b.charAt(0).toUpperCase() + b.slice(1));

        mapStyles[camelCaseName] && mapStyles[camelCaseName].forEach(({ name, type, color }) => {
            this.map.setPaintProperty(name, type, color);
        });
    }



    private setFilters = (): void => {
        const filter: mapboxgl.Expression = [
            'all',
            [
                'match',
                ['get', 'class'],
                [
                    'country',
                    'disputed_country',
                ],
                [
                    'match',
                    ['get', 'worldview'],
                    ['all', 'US'],
                    true,
                    false,
                ],
                false,
            ],
            [
                'match',
                ['get', 'iso_3166_1'],
                ['US'],
                true,
                false,
            ],
            [
                'step',
                ['pitch'],
                true,
                50,
                [
                    '<',
                    [
                        'distance-from-center',
                    ],
                    3,
                ],
                60,
                [
                    '<',
                    [
                        'distance-from-center',
                    ],
                    4,
                ],
                70,
                [
                    '<',
                    [
                        'distance-from-center',
                    ],
                    5,
                ],
            ],
        ];

        this.map.setFilter('country-label', filter);
    };



    private onMapIdle = () => {
        this.map.off('idle', this.onMapIdle);
        (this.view.querySelector('.js-map') as HTMLElement).style.opacity = '1';
    };



    private bind = (): void => {
        !this.settings.zoomOnScroll && this.map.scrollZoom.disable();

        this.locationsElements.forEach((location: HTMLElement) => {
            location.addEventListener('click', this.onLocationClick);
        });


        this.addMarkers();


        // after the GeoJSON data is loaded, update markers on the screen on every frame
        this.map.on('render', () => {
            this.updateMarkers();
        });


        this.map.on('moveend', () => {
            if (this.isZoomingIn) {
                this.setPopup(this.activeLocation);
                this.buildInterviews(this.activeLocation);
            }
            this.isZoomingIn = false;

        });


        this.map.on('movestart', () => {
            this.removeCurrentInterviews();
        });

        breakpoint.phone && this.getTabContent();

        this.toggleButton && this.toggleButton.addEventListener('click', this.onToggleButtonClick);
    };



    private addMarkers = (): void => {
        // clusters
        this.allFeatures = this.locations.map((location: IMapLocation) => MapUtils.convertItemToGeoJSONPoint(location));

        const geojson: mapboxgl.GeoJSONSourceRaw = {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: this.allFeatures,
            },
            cluster: true,
            clusterMaxZoom: this.settings.clusterMaxZoom,
            clusterRadius: this.settings.clusterRadius,
        };

        this.geojson = geojson;
        this.map.addSource(Map.SOURCE_NAME, geojson);

        this.updateMarkers();

        this.map.addLayer({
            id: 'earthquake_circle',
            type: 'circle',
            source: Map.SOURCE_NAME,
            paint: { 'circle-opacity': 0 },
        });
    };



    private updateMarkers(): void {
        const newMarkers = {};
        const features = this.map.querySourceFeatures(Map.SOURCE_NAME);

        // for every cluster on the screen, create an HTML marker for it (if we didn't yet),
        // and add it to the map if it's not there already
        for (let i = 0; i < features.length; i++) {
            const coords = (features[i].geometry as GeoJSON.Point).coordinates;
            const props = features[i].properties;
            const id = props.cluster_id || props.id;
            let marker = this.markers[id];

            if (!marker) {
                const el = document.createElement('div');
                el.className = `map__marker map__marker--${props.cluster ? 'cluster' : 'single'}`;
                if (!props.cluster) { el.dataset.marker = id; }
                if (props.cluster_id) { el.dataset.cluster = props.cluster_id; }
                const currentLocation = this.locations.filter(l => l.id === `${id}`)[0];

                marker = new mapboxgl.Marker(el, { anchor: 'bottom' }).setLngLat(new mapboxgl.LngLat(!props.cluster ? Number(currentLocation.gps_lng) : coords[0], !props.cluster ? Number(currentLocation.gps_lat) : coords[1]));
                this.markers[id] = marker;

                marker.getElement().addEventListener('click', e => {
                    e.stopPropagation();
                    this.onMarkerClick(marker.getElement());
                });
            }
            if (props.cluster) {
                marker.getElement().innerHTML = `<span>${props.point_count}</span>`;
                marker.getElement().style.width = '46px';
                marker.getElement().style.height = '46px';
            } else {
                marker.getElement().innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="63" height="76" viewBox="0 0 63 76" fill="none">
                    <circle cx="31.6143" cy="31" r="31" fill="#548068"/>
                    <circle cx="31.6142" cy="31" r="19.5185" fill="#B79258"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M31.6143 7.73926C44.3168 7.73926 54.6143 18.2046 54.6143 31.1143C54.6143 49.2193 39.0554 53.9793 31.6143 75.7393C25.526 53.9793 8.61426 47.1793 8.61426 31.1143C8.61426 18.2046 18.9117 7.73926 31.6143 7.73926Z" fill="#B79258"/>
                    <circle cx="31.6143" cy="30.7393" r="16" fill="#DBB9B1"/>
                </svg>`;
                marker.getElement().style.width = '';
                marker.getElement().style.height = '';
            }
            newMarkers[id] = marker;

            if (!this.markersOnScreen[id]) marker.addTo(this.map);
        }
        // for every marker we've added previously, remove those that are no longer visible
        // eslint-disable-next-line no-restricted-syntax
        for (const id in this.markersOnScreen) {
            if (!newMarkers[id]) this.markersOnScreen[id].remove();
        }
        this.markersOnScreen = newMarkers;
    }



    private setPopup = (location: IMapLocation): void => {
        if (!location) return;

        // eslint-disable-next-line camelcase
        const { gps_lat, gps_lng, label, address } = location;

        this.popup = new mapboxgl.Popup({ offset: 25, closeButton: false, closeOnClick: false, closeOnMove: true })
            .setLngLat([parseFloat(gps_lng), parseFloat(gps_lat)])
            .setHTML(`
                <div class="map__tooltip map__tooltip--marker">${label}</div>
                <div class="map__tooltip-location">${address}</div>
            `)
            .addTo(this.map);
        this.popup.toggleClassName('is-active');
    };



    private onMarkerClick = (marker: HTMLElement): void => {
        const markerId = marker.dataset.marker;
        const clusterId = marker.dataset.cluster;

        if (markerId) {
            const location = [...this.locations].filter(loc => loc.id === markerId)[0];
            if (location === this.activeLocation || this.isRemovingItems) return;
            this.goToLocation(location);
        } else if (clusterId) {
            (this.map.getSource(Map.SOURCE_NAME) as mapboxgl.GeoJSONSource).getClusterLeaves(parseInt(clusterId, 10), 10, 0, (error, features) => {
                const bounds = new mapboxgl.LngLatBounds();

                features.forEach((feature: GeoJSON.Feature) => {
                    bounds.extend((feature.geometry as GeoJSON.Point).coordinates as mapboxgl.LngLatLike);
                });

                this.map.fitBounds(bounds, {
                    padding: 50,
                    maxZoom: this.settings.maxZoom,
                });
            });
        }

        // scroll left panel to the active location
        const locationEl = [...this.locationsElements].filter(l => l.getAttribute('data-id') === markerId)[0];
        setTimeout(() => {
            this.scrollToElement(locationEl, false);
        }, 500);
    };



    private onToggleButtonClick = (): void => {
        !this.isGlobalView ? this.fitBounds() : this.goToLocation(this.activeLocation || this.locations[0]);
        this.view.classList.toggle('is-zoomed', !this.isGlobalView);
        this.updateToggle();
    };



    private updateToggle = (): void => {
        // this.toggleButton.innerText = this.isGlobalView ? 'Zoom in' : 'Zoom out';
    };



    private fitBounds = (fast?: boolean): void => {
        this.removeCurrentInterviews();

        let bounds;
        if (this.isGlobalMap) {
            bounds = [
                [-124.697, 33.312],
                [-68.317, 47.286],
            ];
        } else {
            bounds = new mapboxgl.LngLatBounds();
            this.locations.forEach(l => {
                // eslint-disable-next-line camelcase
                const { gps_lat, gps_lng } = l;
                bounds.extend([parseFloat(gps_lng), parseFloat(gps_lat)]);
            });
        }

        this.map.fitBounds(bounds, {
            padding: 50,
            maxZoom: 16,
            duration: fast ? 0 : 1000,
        });

        this.isGlobalView = true;
    };



    private onLocationClick = (e: Event): void => {
        const location = e.currentTarget as HTMLElement;
        const locationParent = location.parentElement as HTMLElement;

        const foundLocation: IMapLocation = [...this.locations].filter(l => l.id === location.getAttribute('data-id'))[0];

        if (foundLocation === this.activeLocation || this.isRemovingItems) return;

        this.goToLocation(foundLocation);

        setTimeout(() => {
            this.scrollToElement(locationParent, false);
        }, 500);
    };



    private goToLocation = (location: IMapLocation): void => {
        this.view.classList.add('is-zoomed');

        this.updateToggle();

        this.locationsElements.forEach(l => {
            l.classList.remove('is-active');
            l.parentElement.classList.remove('is-active-location');
        });

        const locationEl: HTMLElement = [...this.locationsElements].filter(l => l.getAttribute('data-id') === location.id)[0];
        locationEl?.classList.add('is-active');
        locationEl?.parentElement.classList.add('is-active-location');
        this.removeCurrentInterviews(true);

        // eslint-disable-next-line camelcase
        const { gps_lat, gps_lng } = location;
        const currentZoom = this.map.getZoom();
        const zoom = currentZoom < this.settings.maxZoom ? this.settings.maxZoom : currentZoom;

        this.map.flyTo({
            center: ([parseFloat(gps_lng), parseFloat(gps_lat)]),
            zoom,
            pitch: this.settings.pitch,
        });
        this.isZoomingIn = true;
        this.isGlobalView = false;
        this.activeLocation = location;
    };



    private scrollToElement = (element: HTMLElement, fast: boolean): void => {
        gsap.to(this.scrolledContainer, {
            scrollTo: { y: element, offsetY: -1 },
            duration: fast ? 0.01 : 1,
            ease: 'power2.inOut',
        });
    };



    private getTabContent = (): void => {
        this.locationsElements.forEach(l => {
            const coords = l.getAttribute('data-coords').split(',').map(el => parseFloat(el));
            const style = (this.settings.style as string).match(/mapbox:\/\/styles\/huncwoty\/(.*)/)[1];

            const url = `https://api.mapbox.com/styles/v1/huncwoty/${style}/static/${coords[1]},${coords[0]},16,0,${this.map.getPitch()}}/400x400?access_token=${token}`;
            const img = `<img src='${url}' class='map-image js-map-image' />
                        <div class="map__marker">
                            <div class="map__tooltip map__tooltip--marker">${l.dataset.title}</div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="63" height="76" viewBox="0 0 63 76" fill="none">
                                <circle cx="31.6143" cy="31" r="31" fill="#548068"/>
                                <circle cx="31.6142" cy="31" r="19.5185" fill="#B79258"/>
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M31.6143 7.73926C44.3168 7.73926 54.6143 18.2046 54.6143 31.1143C54.6143 49.2193 39.0554 53.9793 31.6143 75.7393C25.526 53.9793 8.61426 47.1793 8.61426 31.1143C8.61426 18.2046 18.9117 7.73926 31.6143 7.73926Z" fill="#B79258"/>
                                <circle cx="31.6143" cy="30.7393" r="16" fill="#DBB9B1"/>
                            </svg>
                            <div class="map__tooltip-location">${l.dataset.location}</div>
                        </div>`;

            l.parentElement.querySelector('.js-map-image-wrapper')?.insertAdjacentHTML('beforeend', img);

            const interviews: IMapInterview[] = JSON.parse(l.dataset.interviews) as IMapInterview[];
            [...interviews].forEach(({ id, title, duration }) => {
                const interviewHtml = `
                <li class="map__interview">
                    <button class="map__button" data-audio-player=${id}></button>
                    <div class="map__interview-wrap">
                        <div class="map__interview-data">
                            <div class="map__interview-title">${title}</div>
                            <div class="map__interview-duration">${duration}</div>
                        </div>
                        <div class="map__interview-button">Play <br> interview</div>
                    </div>
                </li>`;

                l.parentElement.querySelector('.js-interviews-inner-list')?.insertAdjacentHTML('beforeend', interviewHtml);
            });
        });

        AudioPlayer.instance.bindButtons();
        this.contentInjected = true;
    };


    private removeCurrentInterviews = (fast = false): void => {
        const interviews = this.interviewsList.querySelectorAll('li');
        if (interviews.length === 0) return;
        const removingCurrent = this.activeLocation;
        this.isRemovingItems = true;
        this.interviewsList.classList.remove('is-active');
        if (fast) {
            this.interviewsList.innerHTML = '';
        }
        const isMany = interviews.length > 3;
        [...interviews].reverse().forEach((item, index) => {
            gsap.to(item, {
                y: (item.clientHeight * 2) * interviews.length,
                rotate: index % 2 === 0 ? 15 : -15,
                duration: fast ? 0.01 : (isMany ? 0.5 : 0.8),
                delay: fast ? 0 : index * (isMany ? 0.1 : 0.07),
                ease: easing,
                onComplete: () => {
                    if (!fast) {

                        item.remove();
                    }
                    // after all tweens
                    if (index === interviews.length - 1) {
                        this.isRemovingItems = false;

                        if (!fast && !this.isZoomingIn && removingCurrent === this.activeLocation) {
                            this.interviewsList.innerHTML = '';
                            this.activeLocation = null;
                        }
                    }
                },
            });
        });
    };



    private buildInterviews = (location: IMapLocation): void => {
        // empty existing list items first
        this.interviewsList.innerHTML = '';


        if (!location) return;
        const interviews: IMapInterview[] = location.quotes as IMapInterview[];

        this.interviewsList.classList.toggle('map__interviews--long', (interviews.length > 3 || ['77', '70'].includes(this.activeLocation.id)));
        this.interviewsList.classList.toggle('map__interviews--no-address', ((this.activeLocation.address.length === 0)));
        [...interviews].forEach(interview => {
            const interviewHtml = `
            <li class="map__interview">
                <button class="map__button" data-audio-player="${interview.id}" data-start="${interview.start}"></button>
                <div class="map__interview-wrap">
                    <div class="map__interview-data">
                        <div class="map__interview-title"><span>${interview.title}</span></div>
                        <div class="map__interview-duration">${interview.duration}</div>
                    </div>
                    <div class="map__interview-button"><span>Play <br> <span class='map__interview-inter'>interview</span></span></div>
                </div>
            </li>`;
            this.interviewsList.insertAdjacentHTML('beforeend', interviewHtml);
        });
        const interviewsEl = this.interviewsList.querySelectorAll('li');
        const isMany = false;
        [...interviewsEl].reverse().forEach((item, index) => {
            gsap.from(item, {
                y: (item.clientHeight) * interviews.length,
                duration: (isMany ? 0.5 : 0.8),
                delay: (isMany ? 0.1 : 0.07) * index,
                ease: interviewsEl.length === 1 ? easing : 'back.out(1.2)',
                onComplete: () => {
                    if (index === interviews.length - 1) {
                        this.interviewsList.classList.add('is-active');
                    }
                },
            });
        });
        AudioPlayer.instance.bindButtons();
    };
}
