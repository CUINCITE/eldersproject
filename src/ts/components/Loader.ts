import { gsap } from 'gsap/dist/gsap';
import { Component } from './Component';
import { Circle } from './Circle';

export class LoaderEvents {
    public static LOADED: string = 'loaded';
}

// TEMP for creating pseudo load progress
const steps = [1, 5, 12, 46, 99];

export class Loader extends Component {

    private countEl: HTMLElement;
    private logoWrap: HTMLElement;
    private lineEl: HTMLElement;
    private counterWidth: number;
    private circleComp: Circle;

    constructor(protected view: HTMLElement) {
        super(view);

        this.circleComp = new Circle(document.querySelector('.js-loader-circle'));
        this.countEl = this.view.querySelector('.js-loader-count');
        this.logoWrap = this.view.querySelector('.js-loader-logo');
        this.lineEl = this.view.querySelector('.js-loader-line');
        this.counterWidth = this.countEl.clientWidth;

        this.updatePositions(true);
    }



    public onState(): boolean {
        this.circleComp?.onState();
        return false;
    }



    public animate = (): Promise<void> => this.setCounterLoop();



    public check = (isHomePage: boolean): void => {
        isHomePage && this.circleComp.show();
    };



    public hide = (): void => {
        gsap.fromTo(this.view, { opacity: 1 }, {
            opacity: 0,
            duration: 0.5,
            ease: 'sine',
            onComplete: () => {
                this.view.style.display = 'none';
                document.body.classList.add('is-loader-hidden');
            },
        });
    };



    private setCounterLoop = (): Promise<void> => new Promise(resolve => {
        let count = -1;
        const interval = setInterval(() => {
            // eslint-disable-next-line no-plusplus
            count++;

            if (count === steps.length) {
                clearInterval(interval);
                // this.trigger(LoaderEvents.LOADED);
                resolve();
                return;
            }
            this.countEl.innerHTML = `${steps[count]}%`;
            this.updatePositions(false, steps[count]);

        }, 1000);
    });



    private updatePositions = (fast?: boolean, value?: number): void => {
        const newCounterWidth = this.countEl.clientWidth;

        // prevent sliding images' wrapper back when new counter is narrower than previous
        if (newCounterWidth >= this.counterWidth) {
            this.counterWidth = newCounterWidth;
            this.circleComp.updatePosition(this.counterWidth, fast);
        }

        this.logoWrap.style.height = `${value}%`;

        // line should be up to 100% but loader is counting to 99
        this.lineEl.style.height = `${value > 95 ? 100 : value}%`;
    };
}