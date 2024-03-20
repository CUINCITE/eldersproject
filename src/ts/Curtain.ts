import { gsap } from 'gsap/dist/gsap';
import { easing } from './Site';


export interface IImages {
    items: [{
        id: number;
        src: string;
        color: string;
    }]
}

export class Curtain {


    private bg: HTMLElement;
    private imageWrap: HTMLElement;
    private circle: HTMLElement;
    private lead: HTMLElement;
    private images = [];



    constructor(protected view: HTMLElement) {

        this.bg = this.view.querySelector('.js-curtain-bg');
        this.imageWrap = this.view.querySelector('.js-curtain-image');
        this.circle = this.view.querySelector('.js-curtain-circle');
        this.lead = this.view.querySelector('.js-curtain-lead');

        this.init();
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
        if (abort) {
            this.getNewImage();
            return;
        }

        gsap.set(this.bg, { transformOrigin: 'center bottom' });

        gsap.fromTo(this.lead, { xPercent: 0 }, {
            xPercent: -120,
            duration: 0.6,
            ease: easing,
        });
        gsap.fromTo(this.imageWrap, { opacity: 1 }, {
            opacity: 0,
            duration: 0.6,
            delay: 0.05,
            ease: easing,
        });
        gsap.fromTo(this.imageWrap, { scale: 1 }, {
            scale: 0.3,
            duration: 0.6,
            delay: 0.05,
            ease: easing,
        });
        gsap.fromTo(this.circle, { scale: 1.2 }, {
            scale: 0.3,
            duration: 0.55,
            ease: easing,
        });
        gsap.fromTo(this.circle, { opacity: 1 }, {
            opacity: 0,
            duration: 0.55,
            ease: easing,
        });
        gsap.fromTo(this.bg, { scaleY: 1 }, {
            scaleY: 0,
            duration: 0.8,
            delay: 0.15,
            ease: easing,
            clearProps: 'transform',
            onComplete: () => {
                // this.view.style.display = 'none';
                this.view.classList.remove('is-active');
                this.getNewImage();
            },
        });
    };



    public makeOverlay = (): void => {
        this.view.classList.add('is-active');
    };



    private getNewImage = (): void => {
        const image = this.images[Math.floor(Math.random() * this.images.length)];

        this.imageWrap.querySelector('img').src = image.src;
        this.circle.style.backgroundColor = `var(--color-${image.color})`;
    };



    private init = async(): Promise<void> => {
        this.getImages().then(data => {
            this.images = data.items;
        });
    };



    private async getImages(): Promise<IImages> {
        try {
            const response = await fetch(this.view.dataset.items, { method: 'POST' });
            const data = response.json();
            return data;
        } catch (error) {
            throw new Error(error);
        }
    }
}
