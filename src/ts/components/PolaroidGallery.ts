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

        this.showSlide(index, direction, fast);
    };


    private showSlide = (index: number, direction: number, fast?: boolean): void => {

        this.activeSlideIndex = (this.activeSlideIndex += direction);

        const previousSlide = this.slides[this.activeSlideIndex - 1];
        const firstSlide = this.slides[this.activeSlideIndex];
        const secondSlide = this.slides[this.activeSlideIndex + 1];
        const nextSlide = this.slides[this.activeSlideIndex + 2];

        this.captions.forEach((caption: HTMLElement, i: number) => {
            caption.classList.toggle('is-active', i === this.activeSlideIndex);
        });

        console.log(this.captions);

        [previousSlide, firstSlide, secondSlide, nextSlide].forEach((slide: HTMLElement) => {
            if (!slide) return;
            const prefix = 'is-';
            const slideClassName = slide.className.split(' ').filter(c => !c.startsWith(prefix));
            slide.className = slideClassName.join(' ').trim();
        });

        previousSlide && previousSlide.classList.add('is-left-outer');
        firstSlide && firstSlide.classList.add('is-first-visible');
        secondSlide && secondSlide.classList.add('is-second-visible');
        nextSlide && nextSlide.classList.add('is-right-outer');

        this.updateArrows();
    };

    private updateArrows(): void {

        switch (this.activeSlideIndex) {
            case 0:
                this.view.classList.toggle('is-first');
                break;
            case this.slides.length - 1:
                this.view.classList.toggle('is-last');
                break;
            default:
                this.view.classList.remove('is-first', 'is-last');
        }
    }
}
