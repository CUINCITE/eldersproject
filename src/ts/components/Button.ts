import { gsap } from 'gsap/dist/gsap';
import { SplitText } from 'gsap/dist/SplitText';
import { Component } from './Component';
import { breakpoint, easing } from '../Site';
import { debounce } from '../Utils';

gsap.registerPlugin(SplitText);

interface IButtonSettings {
    sibling?: boolean; // If the button/link is a sibling of animated items (eg link it's empty itself)
}

export class Button extends Component {

    private button: HTMLElement;
    private splitText: any;
    private horizontal: HTMLElement;
    private vertical: HTMLElement;
    private triangle: HTMLElement;
    private arrow: HTMLElement;
    private tl: gsap.core.Timeline;
    private settings: IButtonSettings;

    constructor(protected view: HTMLElement) {
        super(view);

        this.settings = { ...{ sibling: false }, ...JSON.parse(this.view.getAttribute('data-options')) };

        this.button = this.settings.sibling ? this.view.parentElement : this.view;
        this.bind();

        window.addEventListener('resize', debounce(() => this.tl.invalidate()));
    }

    private bind(): void {


        this.splitText = new SplitText(this.button.querySelector('.js-button-text'), { type: 'words', wordsClass: 'word' });
        this.horizontal = this.button.querySelector('.js-arrow-horizontal');
        this.vertical = this.button.querySelector('.js-arrow-vertical');
        this.triangle = this.button.querySelector('.js-arrow-triangle');
        this.arrow = this.button.querySelector('.js-arrow');

        this.setupTimeline();
        this.setupListeners();
    }

    private setupTimeline(): void {
        if ([this.vertical, this.horizontal, this.triangle, this.arrow].some(el => !el)) return;

        this.tl && this.tl.kill();
        this.tl = gsap.timeline({ paused: true, defaults: { ease: easing } });

        if (this.button.classList.contains('button--simple')) {

            if (this.button.classList.contains('button--reversed')) {
                const arrowExtra = this.button.querySelector('.js-arrow-extra');

                this.splitText.words[0] && this.tl
                    .to(this.splitText.words[0], {
                        x: () => this.arrow.offsetWidth * 1.08,
                        duration: 0.6,
                        delay: 0.05,
                        ease: easing,
                    }, 'arrow')
                    .to(this.arrow, {
                        x: () => this.arrow.offsetWidth * 1.08,
                        duration: 0.6,
                        ease: easing,
                    }, 'arrow');

                arrowExtra && this.tl
                    .to(arrowExtra, {
                        x: () => this.arrow.offsetWidth * 1.08,
                        duration: 0.6,
                        delay: 0.1,
                        ease: easing,
                    }, 'arrow');

            } else {
                const duplicateText = this.button.querySelector('.js-button-duplicate-text');

                this.splitText.words[0] && this.tl
                    .to(this.splitText.words[0], {
                        x: () => this.splitText.words[0].offsetWidth * 1.06,
                        duration: 0.6,
                        ease: easing,
                    }, 'arrow')
                    .to(this.arrow, {
                        transformOrigin: 'right center',
                        x: () => this.splitText.words[0].offsetWidth * 1.06,
                        duration: 0.6,
                        delay: 0.05,
                        ease: easing,
                    }, 'arrow');

                duplicateText && this.tl.to(duplicateText, {
                    x: () => this.splitText.words[0].offsetWidth * 1.06,
                    duration: 0.6,
                    delay: 0.1,
                    ease: easing,
                }, 'arrow');
            }
        } else if (this.button.classList.contains('button--draw')) {

            const mm = gsap.matchMedia();

            mm.add('(orientation: landscape)', () => {
                gsap.set(this.vertical, { scaleY: 0 });
                gsap.set(this.horizontal, { scaleX: 0 });
                gsap.set(this.triangle, { scale: 0 });

                const duration = 0.3;

                this.tl
                    .to(this.vertical, {
                        scaleY: 1,
                        duration: duration * 0.5,
                        transformOrigin: `${this.arrow.classList.contains('arrow--reversed') ? 'bottom' : 'top'} center`,
                    })
                    .to(this.horizontal, {
                        scaleX: 1,
                        duration,
                        transformOrigin: 'left center',
                    }, 'arrow')
                    .fromTo(
                        this.triangle,
                        { x: () => -this.horizontal.offsetWidth },
                        {
                            x: 0,
                            scale: 1,
                            duration,
                            transformOrigin: 'left center',
                        },
                        'arrow',
                    );
            });

        } else {
            this.splitText.words[0] && this.tl
                .to(this.splitText.words[0], {
                    yPercent: 150,
                    rotate: -15,
                    duration: 0.5,
                })
                .to(this.horizontal, {
                    transformOrigin: 'left center',
                    scaleX: () => (this.splitText.words[0].offsetWidth / this.horizontal.offsetWidth) + 1.01,
                    delay: -0.5,
                    duration: 0.65,
                }, 'arrow')
                .to(this.triangle, {
                    transformOrigin: 'left center',
                    x: () => this.splitText.words[0].offsetWidth,
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

        this.view.addEventListener('focus', () => {
            breakpoint.desktop && this.tl.play();
        });

        this.view.addEventListener('blur', () => {
            breakpoint.desktop && this.tl.reverse();
        });
    }
}
