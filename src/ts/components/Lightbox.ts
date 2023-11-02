import { gsap } from 'gsap/dist/gsap';

import { Component } from './Component';
import { Templates } from '../templates/Templates';
import { PushStates } from '../PushStates';

import { normalizeUrl } from '../Utils';


export interface Image {
    src: string;
    [key: string]: any;
}


export interface LightboxItem {
    url?: string;
    title?: string;
    subtitle?: string;
    text: string;
    image: Image;
    index: number;
}


export interface LightboxData {
    url: string;
    backUrl: string;
    items: LightboxItem[],
    index: number;
}


export interface Elements {
    arrowPrev?: HTMLAnchorElement | HTMLButtonElement;
    arrowNext?: HTMLAnchorElement | HTMLButtonElement;
    close?: HTMLAnchorElement | HTMLButtonElement;
    count?: HTMLElement;
    items?: NodeListOf<HTMLElement>;
}


export interface Settings {
    currentIndex: number;
    total: number;
    isAnimating?: boolean;
    loop?: boolean;
}


export interface LightboxCacheItem {
    el: HTMLElement;
    index: number;
    path: string;
}

export class Lightbox extends Component {
    public elements: Elements;
    public settings: Settings;
    public cache: LightboxCacheItem[];

    private animating: boolean;
    private isReloading: boolean;

    constructor(protected view: HTMLElement) {
        super(view);
    }


    public store = (): void => {
        this.elements = {
            arrowPrev: this.view.querySelector('.js-prev'),
            arrowNext: this.view.querySelector('.js-next'),
            close: this.view.querySelector('.js-close'),
            count: this.view.querySelector('.js-count'),
            items: this.view.querySelectorAll('[data-lightbox-path]'),
        };

        this.settings = {
            currentIndex: 0,
            total: this.elements.items.length,
        };

        this.cache = [...this.elements.items].map((el, index) => {
            const path = el.dataset.lightboxPath;

            return {
                el,
                index,
                path,
            };
        });
    };


    public onState(): boolean {
        return this.toggleByPathname();
    }


    public destroy(): void {
        this.removeEvents();
        this.cache = null;
        this.elements = {};
        this.view.innerHTML = '';
    }


    public build = (data: LightboxData): HTMLElement => {
        const template = Templates.get('lightbox');
        const html = template.render(data);
        this.view.innerHTML = html;

        this.init();

        return this.view;
    };


    public updateArrows(): void {
        this.elements.arrowPrev.classList.toggle('is-disabled', this.settings.currentIndex <= 0);
        this.elements.arrowNext.classList.toggle('is-disabled', this.settings.currentIndex >= this.settings.total - 1);
    }


    private init(): void {
        this.store();
        this.toggleByPathname(window.location.pathname, true);
        this.attachEvents();
    }


    private attachEvents = () => {
        const { arrowPrev, arrowNext } = this.elements;

        arrowPrev.addEventListener('click', this.onPrevClick);
        arrowNext.addEventListener('click', this.onNextClick);
    };


    private removeEvents = () => {
        const { arrowPrev, arrowNext } = this.elements;

        arrowPrev?.removeEventListener('click', this.onPrevClick);
        arrowNext?.removeEventListener('click', this.onNextClick);
    };


    private toggleByPathname(pathname?: string, force?: boolean): boolean {
        const item = this.getItemByPathname(pathname);
        if (item) { this.goToItem(item); } else if (force) { this.goToItem(this.cache[0]); }
        return !!item || !!force;
    }

    private goToItem(item: LightboxCacheItem, fast?: boolean): void {
        if (!item) { return; }
        this.isReloading = true;
        this.hideItem(this.settings.currentIndex, fast).then(() => this.showItem(item.index, fast));
    }


    private getItemByPathname(pathname?: string): LightboxCacheItem {
        if (!this.cache || !this.cache.length) { return null; }
        pathname = typeof pathname !== 'undefined' && pathname !== null ? pathname : window.location.pathname;
        pathname = normalizeUrl(pathname);
        const item = this.cache.filter(cache => cache.path === pathname)[0];
        return item;
    }


    private onPrevClick = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        this.go(-1);
    };


    private onNextClick = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        this.go(1);
    };


    private go(dir: number): void {
        const targetIndex = this.settings.currentIndex + dir;
        if (!this.settings.loop && (targetIndex < 0 || targetIndex > this.settings.total - 1)) { return; }
        PushStates.goTo(this.cache[targetIndex].path, true);
    }


    private hideItem(index: number, fast?: boolean): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.animating) {
                reject();
                return;
            }

            const currentItem = this.elements.items[index];
            this.elements.items.forEach(el => el.classList.remove('is-current'));

            this.animating = true;
            gsap.to(currentItem, {
                duration: 0.1,
                opacity: 0,
                ease: 'sine.out',
                onComplete: (): void => {
                    this.animating = false;
                    resolve();
                },
            });
        });
    }


    private showItem(index: number, fast?: boolean): void {
        this.settings.currentIndex = Math.min(this.settings.total, Math.max(0, index));
        if (this.settings.currentIndex === undefined) { this.settings.currentIndex = 0; }
        const currentItem = this.elements.items[this.settings.currentIndex];

        this.elements.items.forEach(el => el.classList.remove('is-current'));

        currentItem.classList.add('is-current');


        gsap.fromTo(currentItem, { opacity: 0 }, {
            opacity: 1,
            duration: 0.4,
            ease: 'sine.out',
            onComplete: (): void => {
                this.isReloading = false;
            },
        });

        this.updateArrows();
    }
}
