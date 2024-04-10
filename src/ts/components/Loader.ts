import { gsap } from 'gsap/dist/gsap';
import { easing, isActiveSession } from '../Site';
import { Component } from './Component';
import { Circle } from './Circle/Circle';

export class LoaderEvents {
    public static LOADED: string = 'loaded';
}

// TEMP for creating pseudo load progress
const steps = [1, 12, 46, 99];

export class Loader extends Component {

    private countEl: HTMLElement;
    private logoWrap: HTMLElement;
    private lineEl: HTMLElement;
    private counterWidth: number;
    // private circleComp: Circle;
    private isHidden = false;
    private percentage = { value: 1 };


    constructor(protected view: HTMLElement) {
        super(view);

        // this.circleComp = new Circle(document.querySelector('.js-loader-circle'));
        this.countEl = this.view.querySelector('.js-loader-count');
        this.logoWrap = this.view.querySelector('.js-loader-logo');
        this.lineEl = this.view.querySelector('.js-loader-line');
        this.counterWidth = this.countEl?.clientWidth || 0;

        isActiveSession && this.updateHtml(steps[steps.length - 1]);
        // this.updatePositions(true);
    }



    // public onState(): boolean {
    //     this.circleComp?.onState();
    //     return false;
    // }


    public resize = (): void => this.updatePositions(true);



    // public animate = (): Promise<void> => this.circleComp.init().then(() => this.setNewAnimation());
    public animate = (): Promise<void> => this.setNewAnimation();



    // public check = (isHomePage: boolean): void => {
    //     isHomePage ? this.circleComp.show() : this.circleComp.hide();
    // };



    public hide = (): void => {
        gsap.fromTo(this.view, { opacity: 1 }, {
            opacity: 0,
            duration: 0.5,
            ease: 'sine',
            onStart: () => {
                document.body.classList.add('is-loader-hiding');
            },
            onComplete: () => {
                document.body.classList.remove('is-loader-hiding');
                document.body.classList.add('is-loader-hidden', 'is-fully-loaded');
                // this.view.style.display = 'none';
                this.view.style.pointerEvents = 'none';
                this.isHidden = true;

                // Utils.setSessionStorageItem('loaded', '1');
            },
        });
    };



    private setNewAnimation = (): Promise<void> => new Promise(resolve => {
        gsap.fromTo(this.percentage, { value: 1 }, {
            value: 99,
            duration: 1,
            ease: easing,
            onUpdate: () => {
                this.updateHtml(Math.floor(this.percentage.value));
            },
            onComplete: () => resolve(),
        });
    });



    private updateHtml = (value: number, fast?: boolean): void => {

        this.updatePositions(false, value);

        if (!this.countEl) { return; }

        const oldValue = this.countEl?.querySelector('span');
        const newValue = document.createElement('span');
        newValue.innerHTML = `<span>${value}%</span>`;

        this.countEl?.insertAdjacentHTML('beforeend', newValue.outerHTML);

        gsap.to(oldValue, {
            opacity: 0,
            duration: fast ? 0 : 0,
            ease: 'sine',
            onComplete: () => oldValue?.remove(),
        });

        gsap.fromTo(newValue, { opacity: 0 }, {
            opacity: 1,
            duration: fast ? 0 : 0,
            ease: 'sine',
        });
    };



    private updatePositions = (fast?: boolean, value?: number): void => {
        // const newCounterWidth = this.countEl?.clientWidth || 0;

        // prevent sliding images' wrapper back when new counter is narrower than previous - ONLY when loader is animating
        // if (newCounterWidth >= this.counterWidth || this.isHidden) {
        //     this.counterWidth = newCounterWidth;
        //     this.circleComp.updatePosition(this.counterWidth, fast);
        // }

        // const heroFirstLine = document.querySelector('.js-hero-first-line') as HTMLElement;
        // if (!this.countEl && heroFirstLine) {
        //     this.circleComp.updatePosition(heroFirstLine.offsetWidth, fast);
        // }

        // this.logoWrap.style.height = `${value}%`;

        // line should be up to 100% but loader is counting to 99
        // this.lineEl.style.height = `${value > 95 ? 100 : value}%`;
        // gsap.set(this.lineEl, { scaleY: (value > 95 ? 100 : value / 100) });
    };
}
