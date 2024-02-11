/* eslint-disable max-len */
import mapboxgl from 'mapbox-gl';
import { gsap } from 'gsap/dist/gsap';
import { debounce } from '../Utils';
import { Component } from './Component';
import { breakpoint, easing, local } from '../Site';
import { AudioPlayer } from './AudioPlayer';

export const token = local ? 'pk.eyJ1IjoiaHVuY3dvdHkiLCJhIjoiY2lwcW04em50MDA1OWkxbnBldXVoMXFrdCJ9.kQro-nPHRoqP_XKLLsR3gA'
    : 'pk.eyJ1IjoiaHVuY3dvdHkiLCJhIjoiY2lwcW04em50MDA1OWkxbnBldXVoMXFrdCJ9.kQro-nPHRoqP_XKLLsR3gA';

export interface IMapSettings {
    lat: number;
    lng: number;
    zoom?: number;
    style?: mapboxgl.Style | string;
    scroll?: boolean;
    token?: string;
    renderWorldCopies?: boolean;
    interactive?: boolean;
    pitch: number;
    clusterRadius?: number;
    clusterMaxZoom?: number;
    zoomOnScroll?: boolean;
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


    constructor(protected view: HTMLElement) {
        super(view);

        this.settings = {
            lng: -122,
            lat: 37,
            zoom: 10,
            interactive: true,
            renderWorldCopies: true,
            style: 'mapbox://styles/huncwoty/clomwmey400bl01pmhj6o5q61',
            token,
            pitch: 60,
            zoomOnScroll: false,
        };

        this.settings = Object.assign(this.settings, JSON.parse(this.view.getAttribute('data-options')));
        this.locationsElements = this.view.querySelectorAll('.js-location');
        this.interviewsList = this.view.querySelector('.js-interviews-list');
        this.contentInjected = false;
        this.toggleButton = this.view.querySelector('.js-toggle-button');
        this.locations = JSON.parse(this.view.getAttribute('data-locations')) as IMapLocation[];

        this.init();

        window.addEventListener('resize', debounce(() => breakpoint.phone && !this.contentInjected && this.getTabContent()));
    }



    private init = (): Promise<void> => new Promise(resolveAll => {
        mapboxgl.accessToken = this.settings.token;
        this.map = new mapboxgl.Map({
            container: this.view.querySelector('.js-map') as HTMLElement,
            style: this.settings.style,
            center: [this.settings.lng, this.settings.lat],
            zoom: this.settings.zoom,
            renderWorldCopies: this.settings.renderWorldCopies,
            interactive: this.settings.interactive,
            dragRotate: false,
            touchZoomRotate: false,
            pitch: 60,
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
        this.map.on('idle', this.onMapIdle);
        this.bind();
        // this.locationsElements.length && this.goToLocation(this.locationsElements[0]);

        this.fitBounds(true);
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


        this.locations.forEach(location => {
            this.setMarker(location);
        });


        this.map.on('moveend', () => {
            if (this.isZoomingIn) {
                this.setPopup(this.activeLocation);
                this.buildInterviews(this.activeLocation);
            }
            this.isZoomingIn = false;
        });


        this.map.on('movestart', () => {
            this.popup?.remove();
            this.removeCurrentInterviews();
        });

        breakpoint.phone && this.getTabContent();

        this.toggleButton && this.toggleButton.addEventListener('click', this.onToggleButtonClick);
    };



    private setMarker = (location: IMapLocation): void => {
        // eslint-disable-next-line camelcase
        const { gps_lng, gps_lat } = location;

        const elMarker = document.createElement('div');
        elMarker.classList.add('map__marker');
        elMarker.setAttribute('data-id', location.id);
        elMarker.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="63" height="76" viewBox="0 0 63 76" fill="none">
        <circle cx="31.6143" cy="31" r="31" fill="#548068"/>
        <circle cx="31.6142" cy="31" r="19.5185" fill="#B79258"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M31.6143 7.73926C44.3168 7.73926 54.6143 18.2046 54.6143 31.1143C54.6143 49.2193 39.0554 53.9793 31.6143 75.7393C25.526 53.9793 8.61426 47.1793 8.61426 31.1143C8.61426 18.2046 18.9117 7.73926 31.6143 7.73926Z" fill="#B79258"/>
        <circle cx="31.6143" cy="30.7393" r="16" fill="#DBB9B1"/>
        </svg>`;


        const marker = new mapboxgl.Marker({ element: elMarker })
            // eslint-disable-next-line camelcase
            .setLngLat([parseFloat(gps_lng), parseFloat(gps_lat)])
            .addTo(this.map);

        marker.getElement().addEventListener('click', () => {
            // this.isZoomingIn = true;
            this.onMarkerClick(marker.getElement().getAttribute('data-id'));
        });
    };



    private setPopup = (location: IMapLocation): void => {
        if (!location) return;

        // eslint-disable-next-line camelcase
        const { gps_lat, gps_lng, label, address } = location;

        this.popup = new mapboxgl.Popup({ offset: 25 })
            .setLngLat([parseFloat(gps_lng), parseFloat(gps_lat)])
            .setHTML(`
                <div class="map__tooltip map__tooltip--marker">${label}</div>
                <div class="map__tooltip-location">${address}</div>
            `)
            .addTo(this.map);
        this.popup.toggleClassName('is-active');
    };



    private onMarkerClick = (id: string): void => {
        const location = [...this.locations].filter(loc => loc.id === id)[0];
        this.goToLocation(location);
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

        const bounds = new mapboxgl.LngLatBounds();

        this.locations.forEach(l => {
            // eslint-disable-next-line camelcase
            const { gps_lat, gps_lng } = l;
            bounds.extend([parseFloat(gps_lng), parseFloat(gps_lat)]);
        });

        this.map.fitBounds(bounds, {
            padding: 50,
            maxZoom: 16,
            duration: fast ? 0 : 1000,
        });

        this.isGlobalView = true;
    };



    private onLocationClick = (e: Event): void => {
        const location = e.currentTarget as HTMLElement;
        const foundLocation: IMapLocation = [...this.locations].filter(l => l.id === location.getAttribute('data-id'))[0];

        this.goToLocation(foundLocation);
    };



    private goToLocation = (location: IMapLocation): void => {
        this.isZoomingIn = true;
        this.isGlobalView = false;
        this.view.classList.add('is-zoomed');

        this.updateToggle();

        this.locationsElements.forEach(l => {
            l.classList.remove('is-active');
            l.parentElement.classList.remove('is-active-location');
        });

        const locationEl: HTMLElement = [...this.locationsElements].filter(l => l.getAttribute('data-id') === location.id)[0];
        locationEl?.classList.add('is-active');
        locationEl?.parentElement.classList.add('is-active-location');
        this.removeCurrentInterviews();

        // eslint-disable-next-line camelcase
        const { gps_lat, gps_lng } = location;
        const currentZoom = this.map.getZoom();
        const zoom = currentZoom < 16 ? 16 : currentZoom;

        this.map.flyTo({
            center: ([parseFloat(gps_lng), parseFloat(gps_lat)]),
            zoom,
            pitch: this.settings.pitch,
        });
        this.activeLocation = location;
    };



    private getTabContent = (): void => {
        this.locationsElements.forEach(l => {
            const coords = l.getAttribute('data-coords').split(',').map(el => parseFloat(el));

            const url = `https://api.mapbox.com/styles/v1/huncwoty/clomwmey400bl01pmhj6o5q61/static/${coords[1]},${coords[0]},${this.map.getZoom()},0,${this.map.getPitch()}}/400x400?access_token=${token}`;
            const img = `<img src='${url}' class='map-image js-map-image' />
                        <div class="map__pin">
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
            [...interviews].forEach(interview => {
                const interviewHtml = `<li class="map__interview">
                                            <button class="map__button" data-audio-player=${interview.id}></button>
                                            <div class="map__interview-wrap">
                                                <div class="map__interview-data">
                                                    <div class="map__interview-title">${interview.title}</div>
                                                    <div class="map__interview-duration">${interview.duration}</div>
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


    private removeCurrentInterviews = (): void => {
        const interviews = this.interviewsList.querySelectorAll('li');
        if (!interviews) return;

        [...interviews].reverse().forEach((item, index) => {
            gsap.to(item, {
                y: (item.clientHeight * 2) * interviews.length,
                rotate: index % 2 === 0 ? 15 : -15,
                duration: 0.8,
                delay: index * 0.1,
                ease: easing,
                onComplete: () => {
                    item.remove();
                    // after all tweens
                    if (index === interviews.length - 1) {
                        this.interviewsList.innerHTML = '';
                    }
                },
            });
        });
    };



    private buildInterviews = (location: IMapLocation): void => {
        // empty existing list items first
        this.interviewsList.innerHTML = '';

        const interviews: IMapInterview[] = location.quotes as IMapInterview[];
        [...interviews].forEach(interview => {
            const interviewHtml = `
            <li class="map__interview">
                <button class="map__button" data-audio-player="${interview.id}" data-start="${interview.start}"></button>
                <div class="map__interview-wrap">
                    <div class="map__interview-data">
                        <div class="map__interview-title">${interview.title}</div>
                        <div class="map__interview-duration">${interview.duration}</div>
                    </div>
                    <div class="map__interview-button">Play <br> interview</div>
                </div>
            </li>`;
            this.interviewsList.insertAdjacentHTML('beforeend', interviewHtml);
        });

        AudioPlayer.instance.bindButtons();
    };
}
