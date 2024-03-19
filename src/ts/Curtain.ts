import { gsap } from 'gsap/dist/gsap';
import { Images } from './widgets/Images';
import { easing } from './Site';


export class Curtain {


    private bg: HTMLElement;
    private imageWrap: HTMLElement;
    private circle: HTMLElement;



    constructor(protected view: HTMLElement) {

        this.bg = this.view.querySelector('.js-curtain-bg');
        this.imageWrap = this.view.querySelector('.js-curtain-image');
        this.circle = this.view.querySelector('.js-curtain-circle');
    }



    public show = (): Promise<void> => new Promise(resolve => {
        this.view.style.display = 'block';
        gsap.set(this.imageWrap, { y: 0, rotate: 0 });
        gsap.set(this.circle, { scale: 1, y: 0 });

        gsap.fromTo(this.view, { opacity: 0 }, {
            opacity: 1,
            duration: 0.1,
            ease: 'sine',
            onComplete: () => {
                resolve();
            },
        });
    });



    public hide = (abort?: boolean): void => {
        if (abort) return;

        gsap.set(this.bg, { transformOrigin: 'center bottom' });

        gsap.to(this.imageWrap, {
            y: window.innerHeight,
            rotate: 10,
            duration: 0.9,
            delay: 0.2,
            ease: easing,
        });
        gsap.fromTo(this.circle, { scale: 1 }, {
            scale: 0,
            duration: 0.9,
            delay: 0.05,
            ease: easing,
        });
        gsap.fromTo(this.circle, { y: 0 }, {
            y: window.innerHeight,
            duration: 0.9,
            delay: 0.2,
            ease: easing,
        });
        gsap.fromTo(this.bg, { scaleY: 1 }, {
            scaleY: 0,
            duration: 1,
            delay: 0.35,
            ease: easing,
            clearProps: 'transform',
            onComplete: () => {
                // this.view.style.display = 'none';
                this.view.classList.remove('is-active');
            },
        });
    };



    public makeOverlay = (): void => {
        this.view.classList.add('is-active');
    };



    // private async getImages(): Promise<ICircleItems> {
    //     try {
    //         const response = await fetch(this.view.dataset.items, { method: 'POST' });
    //         const data = response.json();
    //         return data;
    //     } catch (error) {
    //         this.view.classList.remove('is-fetching');
    //         throw new Error(error);
    //     }
    // }
}
