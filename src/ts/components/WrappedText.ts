import gsap from 'gsap';
import { Component } from './Component';
import { debounce } from '../Utils';

export class WrappedText extends Component {

    private allImages: HTMLDivElement[];
    private title: HTMLHeadingElement;

    constructor(protected view: HTMLElement) {
        super(view);
        this.bind();
        this.checkCollisions();

        window.addEventListener('resize', debounce(() => this.checkCollisions()));
    }


    private bind(): void {
        this.allImages = [...this.view.querySelectorAll('.js-wrapped-image')] as HTMLDivElement[];
        this.title = this.view.querySelector('.js-wrapped-title .heading');
    }


    private checkCollisions(): void {

        const mm = gsap.matchMedia();

        mm.add('(orientation: landscape)', () => {
            let previousHeight = this.title ? (this.title.offsetTop + this.title.offsetHeight) : 0;
            // console.log(previousHeight);

            this.allImages.forEach(image => {

                if (image.offsetTop < previousHeight) {
                    // console.log('colission', previousHeight, image.offsetTop);

                    image.style.top = `${previousHeight}px`;
                }

                previousHeight = image.offsetTop + image.offsetHeight;
            });
        });
    }
}
