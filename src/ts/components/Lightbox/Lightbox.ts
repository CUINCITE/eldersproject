import { gsap } from 'gsap/dist/gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { breakpoint } from '../../Site';
import { TemplateNames, Templates } from '../../templates/Templates';
import { PushStates } from '../../PushStates';
import { LightboxData } from './Lightbox.types';
import { Component } from '../../components/Component';
import { AudioPlayer } from '../../components/AudioPlayer';
import { LightboxTranscript } from './LightboxTranscript';
import { LightboxNav } from './LightboxNav';
import { LightboxSlider } from './LightboxSlider';
import { LightboxContents } from './LightboxContents';
import { lightboxColors } from './Lightbox.colors';


gsap.registerPlugin(ScrollTrigger);


export class Lightbox {

    // eslint-disable-next-line no-use-before-define
    public static instance: Lightbox;
    public static isOpen: boolean;
    public static currentId: string;


    public static checkPlayerState(): void {
        Lightbox.instance.checkPlayerState();
    }


    public static tryToUpdateTranscript(time: number): void {
        Lightbox.instance.tryToUpdateTranscript(time);
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
    private transcriptComp: LightboxTranscript;
    private navComp: LightboxNav;
    private sliderComp: LightboxSlider;
    private contentsComp: LightboxContents;

    constructor() {
        Lightbox.instance = this;
        this.view = document.getElementById('lightbox');

        this.hide(true);
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

        this.buildComponents();

        // find button connected to player
        this.playerBtn = this.view.querySelector('.js-player-btn');

        // check if player is playing audio for this lightbox
        this.checkPlayerState();
    };



    private bind = (): void => {
        this.navComp.on('navUpdate', (tab: HTMLElement) => this.onTabsUpdate(tab));
    };



    private onTabsUpdate = (tab: HTMLElement): void => {
        if (this.sliderComp) this.sliderComp.isActive = (tab === null);
    };



    private buildComponents(): void {
        this.transcriptComp = new LightboxTranscript(this.view.querySelector('.js-lightbox-transcript'));
        this.contentsComp = new LightboxContents(this.view.querySelector('.js-lightbox-contents'));
        this.navComp = new LightboxNav(this.view.querySelector('.js-lightbox-nav'), this.view);
        this.sliderComp = this.view.querySelector('.js-lightbox-slider') && new LightboxSlider(this.view.querySelector('.js-lightbox-slider'));
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

            }).catch(() => {
                this.hide();
            });
            return true;
        }


        // just hide:
        if (this.shown) this.hide(!this.shown);

        return false;
    }



    private hide(fast?: boolean): Promise<void> {
        if (this.animating || !this.shown) return Promise.resolve();
        this.controller?.abort();

        // hide lightbox tab if any of them is active
        this.navComp?.hide();


        this.setThemeColor('black', false);

        return new Promise<void>((resolve, reject) => {
            this.animating = true;
            this.view.classList.add('is-closing');
            gsap.to(this.view, {
                duration: fast ? 0 : 0.01,
                opacity: 0,

                // CONNECTED WITH CSS - .is-closing
                delay: fast ? 0 : 0.8,
                ease: 'none',
                onStart: () => {
                    document.body.classList.remove('has-lightbox');
                    AudioPlayer.view.classList.remove('has-active-lightbox');
                    document.body.classList.remove('is-lightbox-open');
                    this.view.classList.remove('is-showing');
                },
                onComplete: (): void => {
                    this.view.style.display = 'none';
                    // could be added in lightbox naivgation
                    this.view.classList.remove('is-default', 'is-not-default', 'is-closing');
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
        if (this.shown) return;


        Promise.all([this.shown ? this.hide() : null]).then(() => {
            this.animating = true;
            this.shown = true;
            this.view.style.opacity = '1';
            this.view.style.display = 'block';

            gsap.to(this.view, {
                duration: 0.1,
                ease: 'none',
                onStart: () => {
                    document.body.classList.add('has-lightbox');
                    this.view.classList.remove('is-closing');
                },
                // that class runs CSS animation
                onComplete: () => {
                    this.view.classList.add('is-showing');
                    document.body.classList.add('is-lightbox-open');
                    // audioplayer should be always expanded when lightbox is open
                    AudioPlayer.openAudioPlayer(true);
                    this.animating = false;
                    Lightbox.isOpen = true;
                    this.bind();
                    setTimeout(() => {
                        this.setThemeColor();
                    }, 900);
                },
            });
        });
    }



    private setThemeColor(color?: string, lightboxBg = true): void {

        const themeColor = color || this.view.firstElementChild.getAttribute('data-theme-color');
        const newColor = lightboxColors[themeColor] || themeColor;
        const lightboxBgColor = lightboxBg ? `var(--color-${themeColor})` : 'none';

        if (themeColor) {
            if (breakpoint.phone) this.view.style.background = lightboxBgColor;
            document.querySelector('meta[name="theme-color"]').setAttribute('content', newColor);
        }
    }



    private checkPlayerState(): void {
        AudioPlayer.view.classList.toggle('has-active-lightbox', AudioPlayer.getId() === Lightbox.getId());

        if (AudioPlayer.getId() === Lightbox.getId() && !AudioPlayer.isAudioPlayerPaused()) {
            this.playerBtn?.classList.add('is-playing');
        } else {
            this.playerBtn?.classList.remove('is-playing');
        }
    }



    private matchPathnamePattern(): boolean {
        return /^\/(workspace\/lightbox|interviews)\/[a-z0-9-]/gmi
            .test(window.location.pathname + window.location.search);
    }



    private tryToUpdateTranscript(time: number): void {
        // update only when lightbox is open and audio player is connected to it
        if (AudioPlayer.getId() !== Lightbox.getId()) return;

        this.transcriptComp.update(time);
        this.contentsComp.update(time);
    }
}
