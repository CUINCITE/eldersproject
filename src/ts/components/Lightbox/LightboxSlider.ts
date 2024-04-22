import { gsap } from 'gsap/dist/gsap';
import { Component } from '../../components/Component';
import { breakpoint, easing } from '../../Site';
import { ISwipeCoordinates, Swipe, SwipeDirections, SwipeEvents } from '../Swipe';


export class LightboxSlider extends Component {

    public isActive = true;
    private wrap: HTMLElement;
    private slides: NodeListOf<HTMLElement>;
    private captions: NodeListOf<HTMLElement>;
    private arrowPrev: HTMLButtonElement;
    private arrowNext: HTMLButtonElement;
    private activeSlide: HTMLElement;
    private activeSlideIndex: number;
    private isAnimating = false;
    private swipeComp: Swipe;

    constructor(protected view: HTMLElement) {
        super(view);

        this.wrap = this.view.querySelector('.js-slider-wrap');
        this.slides = this.wrap.querySelectorAll('.js-slide');
        this.captions = this.view.querySelectorAll('.js-caption');
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
        document.addEventListener('keydown', this.onKeyDown);


        this.swipeComp = new Swipe(this.view, { horizontal: true, vertical: false });
        this.bindSwipeEvents();
    };



    private bindSwipeEvents = (): void => {

        this.swipeComp.on(SwipeEvents.END, (e: ISwipeCoordinates) => {

            switch (e.direction) {
                case SwipeDirections.LEFT:
                    this.goTo(this.activeSlideIndex + 1);
                    break;
                case SwipeDirections.RIGHT:
                    this.goTo(this.activeSlideIndex - 1);
                    break;
                default:
                    console.warn('no direction');
            }
        });
    };



    private onKeyDown = (event: KeyboardEvent): void => {
        if (!this.isActive || this.isAnimating) return;

        if (event.key === 'ArrowRight') {
            this.goTo(this.activeSlideIndex + 1);
        } else if (event.key === 'ArrowLeft') {
            this.goTo(this.activeSlideIndex - 1);
        }
    };



    private goTo = (index: number, fast?: boolean): void => {
        const direction: number = index > this.activeSlideIndex ? 1 : -1;

        if (index < 0 || index >= this.slides.length || this.isAnimating) return;

        this.hideSlide(this.activeSlideIndex, direction, fast);
        this.showSlide(index, direction, fast);
    };



    private hideSlide = (index: number, direction: number, fast?: boolean): void => {
        const slide = this.slides[index];
        const caption = this.captions[index];
        const xPosition = direction * (window.innerWidth * (breakpoint.phone ? -1.5 : -0.75));

        if (!slide) return;

        this.isAnimating = true;

        breakpoint.desktop && gsap.fromTo(slide, { x: 0 }, {
            x: xPosition,
            duration: fast ? 0 : 0.5,
            ease: easing,
            onComplete: () => {
                if (breakpoint.desktop) slide.style.display = 'none';
                else slide.style.opacity = '0';
            },
        });

        gsap.fromTo(caption, { y: 0 }, {
            y: 240,
            duration: fast ? 0 : 0.5,
            ease: easing,
            onComplete: () => {
                caption.style.opacity = '0';
                this.isAnimating = false;
            },
        });
    };



    private showSlide = (index: number, direction: number, fast?: boolean): void => {
        const slide = this.slides[index];
        const caption = this.captions[index];
        console.log(caption);

        const xPosition = direction * (window.innerWidth * (breakpoint.phone ? 1.5 : 0.75));

        gsap.fromTo(caption, { y: 200 }, {
            y: 0,
            delay: 0.3,
            duration: fast ? 0 : 0.5,
            ease: easing,
            onStart: () => {
                caption.style.opacity = '1';
            },
        });

        if(breakpoint.desktop) {
            gsap.fromTo(slide, { x: xPosition }, {
                x: 0,
                duration: fast ? 0.01 : 0.5,
                ease: easing,
                onStart: () => {
                    if (breakpoint.desktop) slide.style.display = 'flex';
                    else slide.style.opacity = '1';
                },
                onComplete: () => {
                    this.activeSlide = slide;
                    this.activeSlideIndex = [...this.slides].findIndex(el => el === slide);
                    this.updateArrows();
                },
            });
        } else {
            console.log("slide", slide, direction);

            const moveX = slide.clientWidth * direction * -1;

            gsap.to(this.wrap, {
                x: `+=${moveX}`,
                duration: fast ? 0.01 : 0.5,
                onComplete: () => {
                    this.activeSlide = slide;
                    this.activeSlideIndex = [...this.slides].findIndex(el => el === slide);
                },
            })
        }
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
