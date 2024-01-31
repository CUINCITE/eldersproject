import { gsap } from 'gsap/dist/gsap';
import { SplitText } from 'gsap/dist/SplitText';
import { Component } from './Component';
import { breakpoint, easing } from '../Site';

gsap.registerPlugin(SplitText);

export class Button extends Component {

    private splitText: any;
    private horizontal: HTMLElement;
    private triangle: HTMLElement;
    private tl: gsap.core.Timeline;

    constructor(protected view: HTMLElement) {
        super(view);
        this.bind();
    }

    private bind(): void {
        this.splitText = new SplitText(this.view.querySelector('.js-link-text'), { type: 'words', wordsClass: 'word' });
        this.horizontal = this.view.querySelector('.js-arrow-horizontal');
        this.triangle = this.view.querySelector('.js-arrow-triangle');

        this.setupTimeline();
    }

    private setupTimeline(): void {

        if (this.splitText.words[0] && this.horizontal && this.triangle) {
            this.tl = gsap.timeline({ paused: true });
            const wordsWidth = 0 + this.splitText.words[0].offsetWidth;

            this.tl
                .to(this.splitText.words[0], {
                    yPercent: 150,
                    rotate: -15,
                    duration: 0.5,
                    ease: easing,
                })
                .to(this.horizontal, {
                    transformOrigin: 'left center',
                    scaleX: (wordsWidth / this.horizontal.offsetWidth) + 1,
                    delay: -0.5,
                    duration: 0.65,
                    ease: easing,
                }, 'arrow')
                .to(this.triangle, {
                    transformOrigin: 'left center',
                    x: wordsWidth,
                    delay: -0.5,
                    duration: 0.65,
                    ease: easing,
                }, 'arrow');


            this.view.addEventListener('mouseenter', () => {
                breakpoint.desktop && this.tl.play();
            });

            this.view.addEventListener('mouseleave', () => {
                breakpoint.desktop && this.tl.reverse();
            });
        }
    }
}
