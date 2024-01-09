import { gsap } from 'gsap/dist/gsap';
import { Component } from '../../components/Component';
import { easing } from '../../Site';


export class LightboxSlider extends Component {

    private wrap: HTMLElement;
    private slides: NodeListOf<HTMLElement>;
    private arrowPrev: HTMLButtonElement;
    private arrowNext: HTMLButtonElement;
    private activeSlide: HTMLElement;
    private activeSlideIndex: number;

    constructor(protected view: HTMLElement) {
        super(view);

        this.wrap = this.view.querySelector('.js-slider-wrap');
        this.slides = this.wrap.querySelectorAll('.js-slide');
        this.arrowPrev = this.view.querySelector('.js-slider-prev');
        this.arrowNext = this.view.querySelector('.js-slider-next');


        this.init();
        this.bind();
    }



    private init = (): void => {
        this.goTo(0, true);
    };



    private bind = (): void => {
        this.arrowNext.addEventListener('click', () => this.goTo(this.activeSlideIndex + 1));
        this.arrowPrev.addEventListener('click', () => this.goTo(this.activeSlideIndex - 1));
    };



    private goTo = (index: number, fast?: boolean): void => {
        const direction: number = index > this.activeSlideIndex ? 1 : -1;

        this.hideSlide(this.activeSlide, direction, fast);
        this.showSlide(this.slides[index], direction, fast);
    };



    private hideSlide = (slide: HTMLElement, direction: number, fast?: boolean): void => {
        if (!slide) return;

        gsap.fromTo(slide, { xPercent: 0 }, {
            xPercent: direction * -100,
            duration: fast ? 0 : 0.25,
            ease: easing,
            onComplete: () => {
                slide.style.display = 'none';
            },
        });
    };



    private showSlide = (slide: HTMLElement, direction: number, fast?: boolean): void => {

        gsap.fromTo(slide, { xPercent: direction * 100 }, {
            xPercent: 0,
            duration: fast ? 0.01 : 0.4,
            ease: easing,
            onStart: () => {
                slide.style.display = 'block';
            },
            onComplete: () => {
                this.activeSlide = slide;
                this.activeSlideIndex = [...this.slides].findIndex(el => el === slide);
                this.updateArrows();
            },
        });
    };



    private updateArrows(): void {
        (this.arrowPrev.querySelector('.js-text') as HTMLElement).innerText = `0${this.activeSlideIndex}`;
        (this.arrowNext.querySelector('.js-text') as HTMLElement).innerText = `0${this.activeSlideIndex + 2}`;

        switch (this.activeSlideIndex) {
            case 0:
                this.view.classList.add('is-first');
                this.view.classList.remove('is-last');
                break;
            case this.slides.length - 1:
                this.view.classList.remove('is-first');
                this.view.classList.add('is-last');
                break;
            default:
                this.view.classList.remove('is-first', 'is-last');
        }
    }
}
