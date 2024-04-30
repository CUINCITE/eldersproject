import gsap from 'gsap';
import { breakpoint } from '../Site';
import { Component } from './Component';
import { debounce } from '../Utils';

export class WrappedText extends Component {

    private allImages: HTMLDivElement[];
    private allPhotos: HTMLDivElement[];
    private title: HTMLHeadingElement;
    private content: HTMLDivElement;


    constructor(protected view: HTMLElement) {
        super(view);

        this.bind();
        this.checkPhotoCount();
        this.checkCollisions();

        window.addEventListener('resize', debounce(() => this.checkCollisions()));
    }


    private bind(): void {
        this.allImages = [...this.view.querySelectorAll('.js-wrapped-image')] as HTMLDivElement[];
        this.allPhotos = [...this.view.querySelectorAll('.js-wrapped-photo')] as HTMLDivElement[];
        this.title = this.view.querySelector('.js-wrapped-title .heading');
        this.content = this.view.querySelector('.js-wrapped-content');
    }


    private checkOverflow(element: HTMLDivElement, containerHeight: number): void {
        if ((element.offsetTop + element.offsetHeight) > containerHeight) {
            element.style.top = `${containerHeight - element.offsetHeight - parseInt(window.getComputedStyle(element).marginTop.replace('px', ''), 10)}px`;
        }
    }

    private checkPhotoCount(): void {
        if (this.allPhotos.length < 4) {
            this.allPhotos.forEach(element => {
                element.querySelector('.js-polaroid')?.classList.add('polaroid--big');
            });
        }
    }


    private checkCollisions(): void {

        const mm = gsap.matchMedia();

        mm.add('(orientation: landscape)', () => {
            const paddingBottom = parseInt(window.getComputedStyle(this.content).paddingBottom.replace('px', ''), 10);
            const containerHeight = this.content.offsetHeight - paddingBottom;

            let previousHeight = this.title ? (this.title.offsetTop + this.title.offsetHeight) : 0;

            this.allImages.forEach(image => {

                this.content && this.checkOverflow(image, containerHeight);

                if (image.offsetTop < previousHeight) {
                    image.style.top = `${previousHeight}px`;
                }

                previousHeight = image.offsetTop + image.offsetHeight;
            });

            if (previousHeight > containerHeight) {
                this.content.style.height = `${previousHeight + paddingBottom}px`;
            }
        });

        if (!breakpoint.desktop) {
            this.content.style.removeProperty('height');
        }
    }
}
