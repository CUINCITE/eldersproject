import { gsap } from 'gsap/dist/gsap';
import { Images } from './widgets/Images';
import { easing } from './Site';


export class Curtain {


    private bg: HTMLElement;
    private imageWrap: HTMLElement;
    private circle: HTMLElement;
    private lead: HTMLElement;



    constructor(protected view: HTMLElement) {

        this.bg = this.view.querySelector('.js-curtain-bg');
        this.imageWrap = this.view.querySelector('.js-curtain-image');
        this.circle = this.view.querySelector('.js-curtain-circle');
        this.lead = this.view.querySelector('.js-curtain-lead');
    }



    public show = (): Promise<void> => new Promise(resolve => {
        this.view.style.display = 'block';
        gsap.set(this.imageWrap, { scale: 1, opacity: 1 });
        gsap.set(this.circle, { scale: 1, opacity: 1 });
        gsap.set(this.lead, { xPercent: -120 });

        gsap.fromTo(this.view, { opacity: 0 }, {
            opacity: 1,
            duration: 0.1,
            ease: 'sine',
        });
        gsap.fromTo(this.circle, { scale: 1 }, {
            scale: 1.2,
            duration: 0.8,
            delay: 1.2,
            ease: easing,
            onComplete: () => {
                resolve();
            },
        });
        gsap.fromTo(this.lead, { xPercent: -120 }, {
            xPercent: 0,
            duration: 0.8,
            delay: 1.2,
            ease: easing,
        });
    });



    public hide = (abort?: boolean): void => {
        if (abort) return;

        gsap.set(this.bg, { transformOrigin: 'center bottom' });

        gsap.fromTo(this.lead, { xPercent: 0 }, {
            xPercent: -120,
            duration: 0.6,
            ease: easing,
        });
        gsap.fromTo(this.imageWrap, { opacity: 1 }, {
            opacity: 0,
            duration: 0.8,
            ease: easing,
        });
        gsap.fromTo(this.imageWrap, { scale: 1 }, {
            scale: 0.3,
            duration: 0.8,
            ease: easing,
        });
        gsap.fromTo(this.circle, { scale: 1.2 }, {
            scale: 0.3,
            duration: 0.8,
            ease: easing,
        });
        gsap.fromTo(this.circle, { opacity: 1 }, {
            opacity: 0,
            duration: 0.8,
            ease: easing,
        });
        gsap.fromTo(this.bg, { scaleY: 1 }, {
            scaleY: 0,
            duration: 0.7,
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
