import { gsap } from 'gsap/dist/gsap';
import { breakpoint, easing } from '../../Site';
import { CurtainData } from './CurtainData';


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

        this.bg = view.querySelector('.js-curtain-bg');
        this.imageWrap = view.querySelector('.js-curtain-image');
        this.circle = view.querySelector('.js-curtain-circle');
        this.lead = view.querySelector('.js-curtain-lead');

        this.init();
    }



    public show = (): void => {
        this.view.style.display = 'block';

        gsap.to(this.view, {
            opacity: 1,
            duration: 0.1,
            ease: 'sine',
        });

        gsap.to(this.imageWrap, {
            scale: 1,
            opacity: 1,
            ease: easing,
            delay: 0.2,
            duration: 0.6,
        });

        gsap.to(this.circle, {
            opacity: 1,
            scale: 1,
            duration: 0.8,
            delay: 0.2,
            ease: easing,
        });

        breakpoint.desktop && gsap.to(this.lead, {
            xPercent: 0,
            duration: 0.8,
            delay: 0.6,
            ease: easing,
        });
    };



    public hide = (abort?: boolean): void => {
        if (abort) {
            this.getNewImage();
            return;
        }

        gsap.set(this.bg, { transformOrigin: 'right bottom' });

        gsap.to(this.lead, {
            opacity: 0,
            duration: 0.2,
            ease: easing,
        });

        gsap.to(this.imageWrap, {
            opacity: 0,
            scale: 0.3,
            duration: 0.4,
            ease: easing,
        });

        gsap.to(this.circle, {
            scale: 0.3,
            opacity: 0,
            duration: 0.55,
            ease: easing,
        });

        gsap.to(this.bg, {
            scaleX: 0,
            duration: 0.8,
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
        this.images = CurtainData.items;
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
