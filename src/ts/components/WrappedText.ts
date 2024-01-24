import gsap from 'gsap';
import { Component } from './Component';
import { debounce } from '../Utils';

export class WrappedText extends Component {

    private allImages: HTMLDivElement[];
    private title: HTMLHeadingElement;
    private content: HTMLDivElement;

    constructor(protected view: HTMLElement) {
        super(view);
        this.bind();
        this.checkCollisions();

        window.addEventListener('resize', debounce(() => this.checkCollisions()));
    }


    private bind(): void {
        this.allImages = [...this.view.querySelectorAll('.js-wrapped-image')] as HTMLDivElement[];
        this.title = this.view.querySelector('.js-wrapped-title .heading');
        this.content = this.view.querySelector('.js-wrapped-content');
    }


    private checkOverflow(element: HTMLDivElement): void {
        const containerHeight = this.content.offsetHeight - parseInt(window.getComputedStyle(this.content).paddingBottom.replace('px', ''), 10);

        if ((element.offsetTop + element.offsetHeight) > containerHeight) {
            element.style.top = `${containerHeight - element.offsetHeight}px`;
        }
    }


    private checkCollisions(): void {

        const mm = gsap.matchMedia();

        mm.add('(orientation: landscape)', () => {
            let previousHeight = this.title ? (this.title.offsetTop + this.title.offsetHeight) : 0;

            this.allImages.forEach(image => {

                if (image.offsetTop < previousHeight) {
                    image.style.top = `${previousHeight}px`;
                }

                previousHeight = image.offsetTop + image.offsetHeight;

                this.content && this.checkOverflow(image);
            });
        });
    }

}
