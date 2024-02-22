import { Component } from '../components/Component';

export class PolaroidGallery extends Component {
    public isActive = true;
    private wrap: HTMLElement;
    private slides: NodeListOf<HTMLElement>;
    private captions: NodeListOf<HTMLElement>;
    private arrowPrev: HTMLButtonElement;
    private arrowNext: HTMLButtonElement;
    private activeSlideIndex = 0;

    constructor(protected view: HTMLElement) {
        super(view);
        this.wrap = this.view.querySelector('.js-slider-wrap');
        this.slides = this.wrap.querySelectorAll('.js-slide');
        this.captions = this.view.querySelectorAll('.js-caption');
        this.arrowPrev = this.view.querySelector('.js-slider-prev');
        this.arrowNext = this.view.querySelector('.js-slider-next');
        this.bind();
    }



    private bind = (): void => {
        this.arrowNext.addEventListener('click', () => this.goTo(this.activeSlideIndex + 1));
        this.arrowPrev.addEventListener('click', () => this.goTo(this.activeSlideIndex - 1));
        this.updateArrows();
    };



    private goTo = (index: number, fast?: boolean): void => {
        const direction: number = index > this.activeSlideIndex ? 1 : -1;
        this.showSlide(direction, fast);
    };



    private showSlide = (direction: number, fast?: boolean): void => {
        this.activeSlideIndex += direction;

        const previousSlide = this.slides[this.activeSlideIndex - 1];
        const firstSlide = this.slides[this.activeSlideIndex];
        const secondSlide = this.slides[this.activeSlideIndex + 1];
        const nextSlide = this.slides[this.activeSlideIndex + 2];

        const slides = [previousSlide, firstSlide, secondSlide, nextSlide];
        const classes = ['is-left-outer', 'is-first-visible', 'is-second-visible', 'is-right-outer'];

        slides.forEach((slide: HTMLElement, i: number) => {
            if (!slide) return;

            const prefix = 'is-';
            const slideClassName = slide.className.split(' ').filter(c => !c.startsWith(prefix));
            slide.className = slideClassName.join(' ').trim();

            slide && slide.classList.add(classes[i]);
        });

        this.captions.forEach((caption: HTMLElement, i: number) => caption.classList.toggle('is-active', i === this.activeSlideIndex));

        this.updateArrows();
    };


    private updateArrows(): void {
        this.view.classList.toggle('is-first', this.activeSlideIndex === 0);
        this.view.classList.toggle('is-last', this.activeSlideIndex === this.slides.length - 1);
    }
}
