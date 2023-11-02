/* eslint-disable no-param-reassign */
import { gsap } from 'gsap/dist/gsap';

import { normalizeUrl } from './Utils';
import { PushStates } from './PushStates';
import { Lightbox, LightboxData, LightboxItem } from './components/Lightbox';


export class Offscreen {
    // eslint-disable-next-line no-use-before-define
    public static instance: Offscreen;

    private lightboxEl: HTMLElement;
    private lightbox: Lightbox;

    private shown: boolean;
    private cache: LightboxData[] = [];


    // eslint-disable-next-line no-unused-vars
    constructor(protected view: HTMLElement) {
        this.lightboxEl = this.view.querySelector('.js-lightbox');
        this.lightbox = new Lightbox(this.lightboxEl);

        Offscreen.instance = this;

        gsap.set(this.view, { yPercent: 100 });
    }


    public onState(): boolean {
        const usedInCurrentLightbox = this.lightbox.onState();
        if (usedInCurrentLightbox) { this.show(); }
        return usedInCurrentLightbox || this.toggleByPathname() || this.shown;
    }


    public reload = (): void => {
        this.store();
        this.toggleByPathname();
    };


    public destroy = (): void => {
        this.lightbox.destroy();
    };


    public store = (): void => {
        const elements: NodeListOf<HTMLElement> = document.querySelectorAll('[data-lightbox-json]');

        this.cache = [...elements].map(el => {
            const json = { ...el.dataset }.lightboxJson;
            const data: LightboxData = JSON.parse(json);
            const items = data.items.map((item, index) => ({ ...item, index }));

            return {
                ...data,
                items,
            };
        });
    };


    public toggle(show?: boolean, fast?: boolean, force?: boolean): void {
        if (typeof show !== 'undefined') {
            if (!!show && (!this.shown || !!force)) {
                this.show(fast);
            } else if (!show && (!!this.shown || !!force)) {
                this.hide(fast);
            }
        } else {
            // eslint-disable-next-line no-shadow
            (this.shown ? fast => this.hide(fast) : fast => this.show(fast))(fast);
        }
    }


    public show(fast?: boolean): void {
        this.shown = true;
        this.view.style.display = 'block';
        gsap.to(this.view, {
            duration: !fast ? 0.6 : 0.01,
            yPercent: 0,
            onComplete: (): void => {
                document.body.classList.add('is-offscreen-open');
            },
        });
    }


    public hide(fast?: boolean): void {
        if (!this.shown) { return; }
        document.body.classList.remove('is-offscreen-open');
        gsap.to(this.view, {
            duration: !fast ? 0.4 : 0.01,
            yPercent: 100,
            onComplete: (): void => {
                this.lightbox.destroy();
                this.shown = false;
                this.view.style.display = 'none';
            },
        });
    }


    private toggleByPathname(): boolean {
        const found = this.getLightboxByPathname();

        if (found) {
            const lightboxEl = this.lightbox.build(found);
            PushStates.bind(lightboxEl);
            this.show();
        } else if (this.shown) {
            this.hide();
        }
        return !!found;
    }


    private getLightboxByPathname = (path?: string): LightboxData | null => {
        path = typeof path !== 'undefined' && path !== null ? path : window.location.pathname;
        path = normalizeUrl(path);

        for (let index = 0; index < this.cache.length; index++) {
            const lightbox = this.cache[index];
            if (normalizeUrl(lightbox.url) === path) {
                return lightbox;
            }
            const itemsFound = lightbox.items.filter((item: LightboxItem) => normalizeUrl(item.url) === path);
            if (itemsFound.length > 0) {
                return lightbox;
            }
        }

        return null;
    };
}
