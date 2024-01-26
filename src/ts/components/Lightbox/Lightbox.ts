import { gsap } from 'gsap/dist/gsap';
import { TemplateNames, Templates } from '../../templates/Templates';
import { PushStates } from '../../PushStates';
import { LightboxData } from './Lightbox.types';
import { easing } from '../../Site';
import { Component } from '../../components/Component';
import { components } from '../../Classes';
import { AudioPlayer } from '../../components/AudioPlayer';



export class Lightbox {

    // eslint-disable-next-line no-use-before-define
    public static instance: Lightbox;
    public static isOpen: boolean;
    public static currentId: string;


    public static checkPlayerState(): void {
        Lightbox.instance.checkPlayerState();
    }


    public static getId(): string {
        return Lightbox.currentId;
    }

    private components: Array<Component>;
    private view: HTMLElement;
    private shown = true;
    private currentPath: string;
    private playerBtn: HTMLButtonElement;

    private animating: boolean;
    private controller: AbortController;

    constructor() {
        Lightbox.instance = this;
        this.view = document.getElementById('lightbox');

        this.hide(true);

        this.bind();
    }



    public async load(payload?: Object): Promise<LightboxData> {
        this.view.classList.add('is-fetching');
        this.controller = new AbortController();

        const isWorkspace = window.location.pathname.indexOf('/workspace/') >= 0;
        // const url = isWorkspace ? this.settings.api[type] : window.location.href + window.location.search;
        const url = isWorkspace
            ? `${window.location.origin}/workspace/json/lightbox/${window.location.pathname.split('/')[3]}.json`
            : window.location.href + window.location.search;

        try {
            const response = await fetch(url, {
                method: 'POST',
                signal: this.controller?.signal,
                body: new URLSearchParams(payload as any),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Elder-Api': 'true',
                },
            });

            const data = await response.json();
            this.view.classList.remove('is-fetching');
            this.controller = null;

            return data;

        } catch (error) {
            this.view.classList.remove('is-fetching');
            throw new Error(error);
        }
    }



    public check(): void {
        this.toggleByPathname();
    }



    public onState(isRendered?: boolean): boolean {
        return this.toggleByPathname(isRendered);
    }



    public destroy(): void {
        this.view.innerHTML = '';
        this.components?.forEach(c => c.destroy());
        this.components = null;
    }



    public build = (data: LightboxData): void => {
        // return early when no data to show
        if (data.result === false) return;

        const template = Templates.get(TemplateNames.LIGHTBOX);

        const html = template.render(data);
        this.view.innerHTML = html;

        PushStates.bind(this.view);

        // lightbox has its own audio player's button to run it
        AudioPlayer.instance.bindButtons();

        Lightbox.currentId = data.id;

        this.buildComponents(this.view.querySelectorAll('[data-component]'));

        // find button connected to player
        this.playerBtn = this.view.querySelector('.js-player-btn');

        // check if player is playing audio for this lightbox
        this.checkPlayerState();

        this.tryToSetColor();
    };



    private tryToSetColor = (): void => {
        const lightboxItem: HTMLElement = this.view.firstElementChild as HTMLElement;
        // for initial load, when lightbox is not rendered yet
        if (!lightboxItem) return;

        // get data-attribute from .lightbox__item and update color variable in audioplayer
        const color: string = lightboxItem.getAttribute('data-theme-color');

        if (color && (AudioPlayer.getId() === Lightbox.getId())) AudioPlayer.updateColors(color);
    };



    private bind = (): void => {
        document.addEventListener('keydown', this.onKeyDown);
    };



    private onKeyDown = (e): void => {
        // ONLY for testing
        // if (e.key === 'r') this.shown ? this.hide() : this.show();
    };



    private buildComponents(componentsList: NodeList): void {
        this.components = [];

        this.components = [...componentsList].map(el => {
            const element = <HTMLElement>el;
            const name = element.dataset.component;
            if (name !== undefined && components[name]) {
                let options: Object = {};
                if (element.dataset.options) {
                    options = JSON.parse(element.dataset.options);
                }
                const component = new components[name](element, options);
                return component;
            }
            window.console.warn('There is no `%s` component!', name);
            return null;
        }).filter(Boolean);
    }



    private toggleByPathname(isRendered?: boolean): boolean {
        const patternFound = this.matchPathnamePattern();

        if (patternFound) {

            Promise.all([
                this.hide(),
                this.load(),
            ]).then(results => {
                const data = results.filter(Boolean).reduce((p, c) => ({ ...p, ...c })) as LightboxData;

                data?.title && PushStates.setTitle(data.title);
                this.currentPath = window.location.pathname;

                this.build(data);

                // show the interview lightbox (only when there's data to show)
                if (!this.shown && data.result !== false) { this.show(); }

                this.animateIn();
            }).catch(() => {
                this.hide();
            });
            return true;
        }


        // just hide:
        if (this.shown) {
            const animate = isRendered;
            !!animate && this.animateOut();
            this.hide(!animate);
        }

        return false;
    }



    private hide(fast?: boolean): Promise<void> {
        if (this.animating || !this.shown) return Promise.resolve();
        this.controller?.abort();

        return new Promise<void>((resolve, reject) => {
            this.animating = true;
            this.view.classList.add('is-closing');
            gsap.to(this.view, {
                duration: fast ? 0 : 0.01,
                opacity: 0,

                // CONNECTED WITH CSS - .is-closing
                delay: fast ? 0 : 1,
                ease: 'none',
                onStart: () => {
                    document.body.classList.remove('has-lightbox');
                    this.view.classList.remove('is-showing');
                },
                onComplete: (): void => {
                    this.view.style.display = 'none';
                    this.shown = false;
                    this.animating = false;
                    // empty the lightbox
                    this.view.innerHTML = '';
                    Lightbox.isOpen = false;
                    resolve();
                },
            });
        });
    }


    private show(): void {
        if (this.animating) return;
        if (this.shown) { return; }


        Promise.all([this.shown ? this.hide() : null]).then(() => {
            this.animating = true;
            this.shown = true;

            gsap.to(this.view, {
                duration: 0.05,
                opacity: 1,
                ease: 'none',
                onStart: () => {
                    document.body.classList.add('has-lightbox');
                    this.view.classList.remove('is-closing');
                    this.view.style.display = 'block';
                },
                // that class runs CSS animation
                onComplete: () => {
                    this.view.classList.add('is-showing');
                    // audioplayer should be always expanded when lightbox is open
                    AudioPlayer.openAudioPlayer();
                    this.animating = false;
                    Lightbox.isOpen = true;
                },
            });
        });
    }



    private checkPlayerState(): void {
        if (AudioPlayer.getId() === Lightbox.getId() && !AudioPlayer.isAudioPlayerPaused()) {
            this.playerBtn?.classList.add('is-playing');
        } else {
            this.playerBtn?.classList.remove('is-playing');
        }
        this.tryToSetColor();
    }



    private matchPathnamePattern(): boolean {
        return /^\/(workspace\/lightbox|interviews)\/[a-z0-9-]/gmi
            .test(window.location.pathname + window.location.search);
    }



    private animateIn(fast?: boolean): Promise<void> {
        return new Promise<void>(resolve => {
            gsap.timeline({
                onComplete: () => {
                    this.view.classList.add('is-visible');
                    resolve();
                },
                defaults: { ease: easing, duration: !fast ? 1 : 0 },
            });

            navigator.vibrate([1, 400, 1]);
        });
    }



    private animateOut(fast?: boolean): Promise<void> {

        if (!this.view.classList.contains('is-visible')) {
            return Promise.resolve();
        }

        return new Promise<void>(resolve => {
            gsap.timeline({
                onComplete: () => {
                    this.view.classList.remove('is-visible');
                    resolve();
                },
                defaults: { ease: 'expo.inOut' },
            });
        });
    }
}
