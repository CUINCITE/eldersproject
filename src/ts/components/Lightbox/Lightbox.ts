import { gsap } from 'gsap/dist/gsap';
import { Templates } from '../../templates/Templates';
import { PushStates } from '../../PushStates';
import { LightboxData } from './Lightbox.types';
import { easing } from '../../Site';
import { Component } from '../../components/Component';
import { components } from '../../Classes';



export class Lightbox {
    private components: Array<Component>;
    private view: HTMLElement;
    private shown = false;
    private currentPath: string;

    private animating: boolean;

    constructor() {
        this.view = document.getElementById('lightbox');

        this.hide(true);
    }



    public async load(payload?: Object): Promise<LightboxData> {
        this.view.classList.add('is-fetching');

        const isWorkspace = window.location.pathname.indexOf('/workspace/') >= 0;
        // const url = isWorkspace ? this.settings.api[type] : window.location.href + window.location.search;
        const url = isWorkspace
            ? `${window.location.origin}/workspace/json/lightbox/${window.location.pathname.split('/')[3]}.json`
            : window.location.href + window.location.search;

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: new URLSearchParams(payload as any),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });

            const data = await response.json();
            this.view.classList.remove('is-fetching');

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
        const template = Templates.get('lightbox');

        const html = template.render(data);
        this.view.innerHTML = html;

        this.buildComponents(this.view.querySelectorAll('[data-component]'));
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
            // show the interview lightbox:
            if (!this.shown) { this.show(); }


            Promise.all([
                this.animateOut(),
                this.load(),
            ]).then(results => {
                const data = results.filter(Boolean).reduce((p, c) => ({ ...p, ...c })) as LightboxData;

                data?.title && PushStates.setTitle(data.title);
                this.currentPath = window.location.pathname;

                this.build(data);

                this.animateIn();
            }).catch(() => {
                // this.hide();
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
        return new Promise<void>((resolve, reject) => {
            if (this.animating) {
                reject();
                return;
            }

            this.animating = true;
            gsap.to(this.view, {
                duration: !fast ? 0.8 : 0,
                yPercent: 100,
                ease: 'expo.inOut',
                onComplete: (): void => {
                    this.shown = false;
                    this.animating = false;
                    resolve();
                },
            });
        });
    }


    private show(fast?: boolean): void {

        if (this.shown) { return; }

        this.shown = true;

        gsap.to(this.view, {
            duration: !fast ? 1 : 0,
            yPercent: 0,
            ease: 'expo.out',
        });
    }



    private matchPathnamePattern(): boolean {
        return /^\/(workspace\/lightbox|lightbox)\/[a-z0-9-]/gmi
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
