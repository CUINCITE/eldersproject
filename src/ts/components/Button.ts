import { gsap } from 'gsap/dist/gsap';
import { SplitText } from 'gsap/dist/SplitText';
import { Component } from './Component';
import { breakpoint, easing } from '../Site';
import { debounce } from '../Utils';

gsap.registerPlugin(SplitText);

export class Button extends Component {

    private splitText: any;
    private horizontal: HTMLElement;
    private triangle: HTMLElement;
    private arrow: HTMLElement;
    private tl: gsap.core.Timeline;

    constructor(protected view: HTMLElement) {
        super(view);
        this.bind();

        window.addEventListener('resize', debounce(() => this.setupTimeline()));
    }

    private bind(): void {
        this.splitText = new SplitText(this.view.querySelector('.js-button-text'), { type: 'words', wordsClass: 'word' });
        this.horizontal = this.view.querySelector('.js-arrow-horizontal');
        this.triangle = this.view.querySelector('.js-arrow-triangle');
        this.arrow = this.view.querySelector('.js-arrow');

        this.setupTimeline();
        this.setupListeners();
    }

    private setupTimeline(): void {
        if (!this.splitText.words[0] || !this.horizontal || !this.triangle || !this.arrow) return;

        this.tl && this.tl.kill();
        this.tl = gsap.timeline({ paused: true, defaults: { ease: easing } });

        const wordsWidth = this.splitText.words[0].offsetWidth;

        if (this.view.classList.contains('button--simple')) {
            if (this.view.classList.contains('button--reversed')) {
                const arrowExtra = this.view.querySelector('.js-arrow-extra');

                this.tl
                    .to(this.splitText.words[0], {
                        x: this.arrow.offsetWidth * 1.08,
                        duration: 0.4,
                    }, 'arrow')
                    .to(this.arrow, {
                        x: this.arrow.offsetWidth * 1.08,
                        duration: 0.4,
                    }, 'arrow');

                arrowExtra && this.tl
                    .to(arrowExtra, {
                        x: this.arrow.offsetWidth * 1.08,
                        duration: 0.4,
                    }, 'arrow');

            } else {
                const duplicateText = this.view.querySelector('.js-button-duplicate-text');

                this.tl
                    .to(this.splitText.words[0], {
                        x: wordsWidth * 1.06,
                        duration: 0.4,
                    }, 'arrow')
                    .to(this.arrow, {
                        transformOrigin: 'right center',
                        x: wordsWidth * 1.06,
                        duration: 0.4,
                    }, 'arrow');

                duplicateText && this.tl.to(duplicateText, {
                    x: wordsWidth * 1.06,
                    duration: 0.4,
                }, 'arrow');

                // this.tl
                //     .to(this.horizontal, {
                //         transformOrigin: 'right center',
                //         scaleX: ((wordsWidth * 1.06) / this.horizontal.offsetWidth) + 1,
                //         duration: 0,
                //     })
                //     .to(this.splitText.words[0], {
                //         x: wordsWidth * 1.06,
                //         duration: 0.4,
                //     }, 'arrow')
                //     .to(this.arrow, {
                //         transformOrigin: 'right center',
                //         x: wordsWidth * 1.06,
                //         duration: 0.4,
                //     }, 'arrow')
                //     .to(this.horizontal, {
                //         transformOrigin: 'right center',
                //         scaleX: 1,
                //         duration: 0.4,
                //         delay: -0.35,
                //     }, 'shrink');

                // duplicateText && this.tl.to(duplicateText, {
                //     x: wordsWidth * 1.06,
                //     duration: 0.4,
                //     delay: -0.3,
                // }, 'shrink');
            }
        } else {
            this.tl
                .to(this.splitText.words[0], {
                    yPercent: 150,
                    rotate: -15,
                    duration: 0.5,
                })
                .to(this.horizontal, {
                    transformOrigin: 'left center',
                    scaleX: (wordsWidth / this.horizontal.offsetWidth) + 1.01,
                    delay: -0.5,
                    duration: 0.65,
                }, 'arrow')
                .to(this.triangle, {
                    transformOrigin: 'left center',
                    x: wordsWidth,
                    delay: -0.5,
                    duration: 0.65,
                }, 'arrow');
        }
    }

    private setupListeners(): void {
        this.view.addEventListener('mouseenter', () => {
            breakpoint.desktop && this.tl.play();
        });

        this.view.addEventListener('mouseleave', () => {
            breakpoint.desktop && this.tl.reverse();
        });
    }
}
