import { gsap } from 'gsap/dist/gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { Accessibility } from './widgets/Accessibility';
import { AudioPlayer } from './components/AudioPlayer';
import { breakpoint, easing } from './Site';
import { debounce } from './Utils';


gsap.registerPlugin(ScrollTrigger);

export class Menu {
    private isOpen = false;

    private elToggle: NodeListOf<HTMLButtonElement>;
    private closeBtn: HTMLButtonElement;
    private wrapEl: HTMLElement;
    private isAnimating = false;
    private items: NodeListOf<HTMLElement>;
    private lines: NodeListOf<HTMLElement>;
    private labels: NodeListOf<HTMLElement>;
    private links: NodeListOf<HTMLElement>;
    private searchLabel: HTMLElement;
    private searchIcon: HTMLElement;
    private timelines: gsap.core.Timeline[];



    // eslint-disable-next-line no-unused-vars
    constructor(protected view: HTMLElement) {
        this.elToggle = document.querySelectorAll('.js-menu-toggle');
        this.closeBtn = this.view.querySelector('.js-menu-close');
        this.wrapEl = document.getElementById('wrapper');
        this.items = this.view.querySelectorAll('.js-menu-item');
        this.labels = this.view.querySelectorAll('.js-menu-label');
        this.lines = this.view.querySelectorAll('.js-menu-line');
        this.links = this.view.querySelectorAll('.js-menu-link');
        this.searchLabel = this.view.querySelector('.js-menu-search-label');
        this.searchIcon = this.view.querySelector('.js-menu-search-svg');
        this.timelines = [];

        this.bind();
    }



    public onState(): void {
        this.isOpen && this.close();
    }



    public resize(): void {
        this.elToggle = document.querySelectorAll('.js-menu-toggle');
        this.bindToggleButtons();
    }



    private bind(): void {
        this.closeBtn && this.closeBtn.addEventListener('click', this.close);

        window.addEventListener('keyup', e => {
            const { key } = e;

            if (key === 'Escape') this.close();
        });

        this.setupHovers();

        // on close menu animation's end (related to whole #content toggle animation) set display: none for menu
        this.wrapEl.addEventListener('transitionend', () => {
            this.onAnimationEnd();
        });
        window.addEventListener('resize', debounce(() => this.timelines.forEach(tl => tl.invalidate())));
    }



    private bindToggleButtons(): void {
        this.elToggle.length && [...this.elToggle].forEach(btn => btn.addEventListener('click', this.onToggle));
    }



    private setupHovers = (): void => {
        this.items.forEach(item => {
            const vertical: HTMLElement = item.querySelector('.js-arrow-vertical');
            const horizontal: HTMLElement = item.querySelector('.js-arrow-horizontal');
            const triangle: HTMLElement = item.querySelector('.js-arrow-triangle');
            const link = item.querySelector('.js-menu-main-link');

            if ([vertical, horizontal, triangle, link].some(el => !el)) return;

            gsap.set(vertical, { scaleY: 0 });
            gsap.set(horizontal, { scaleX: 0 });
            gsap.set(triangle, { scale: 0 });

            const tl = gsap.timeline({ paused: true, ease: easing });
            this.timelines.push(tl);

            const duration = 0.3;

            tl
                .to(vertical, {
                    scaleY: 1,
                    duration: duration * 0.5,
                    transformOrigin: 'bottom center',
                })
                .to(horizontal, {
                    scaleX: 1,
                    duration,
                    transformOrigin: 'left center',
                }, 'arrow')
                .fromTo(
                    triangle,
                    { x: () => -horizontal.offsetWidth },
                    {
                        x: 0,
                        scale: 1,
                        duration,
                        transformOrigin: 'left center',
                    },
                    'arrow',
                );


            item.addEventListener('mouseenter', () => {
                if (Accessibility.isOn) tl.play(1);
                breakpoint.desktop && tl.play();
            });

            item.addEventListener('mouseleave', () => {
                breakpoint.desktop && tl.reverse();
            });

            link.addEventListener('focus', () => {
                if (Accessibility.isOn) tl.play(1);
                breakpoint.desktop && tl.play();
            });

            link.addEventListener('blur', () => {
                breakpoint.desktop && tl.reverse();
            });
        });
    };



    private onAnimationEnd = (): void => {
        this.isAnimating = false;
        if (!this.isOpen) {
            this.view.style.display = 'none';
        }
    };



    private onToggle = (e): void => {
        const { currentTarget } = e;
        const isSearchBtn = currentTarget.hasAttribute('data-search');
        this.isOpen ? this.close() : this.open(isSearchBtn);
    };



    private open = (focusOnSearch?: boolean): void => {
        if (this.isAnimating) return;

        this.isAnimating = true;
        this.isOpen = true;
        this.view.style.display = 'flex';
        document.body.classList.add('has-menu-open');

        // TEMP - js animation later
        if (Accessibility.isOn) {
            this.isAnimating = false;
            this.closeBtn.focus();
        }

        !Accessibility.isOn && gsap.timeline({
            onComplete: () => {
                if (focusOnSearch) {
                    const input: HTMLInputElement = this.searchLabel.closest('form').querySelector('input[type="search"]');
                    input && input.focus();
                }
            },
        })
            .addLabel('init')
            .fromTo(this.labels, { yPercent: 120 }, {
                yPercent: 0,
                duration: 0.9,
                stagger: 0.15,
                ease: 'power2.out',
            }, 'init')
            .fromTo(this.lines, { scaleX: 0 }, {
                scaleX: 1,
                duration: 1,
                stagger: 0.15,
                ease: 'power2.out',
            }, 'init')
            .fromTo(this.links, { xPercent: (!breakpoint.desktop ? -100 : 100) }, {
                xPercent: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power2.out',
            }, '-=.8')
            .fromTo(this.searchIcon, { scale: 0 }, {
                scale: 1,
                duration: 0.4,
                ease: 'power2.out',
            }, '-=.6')
            .fromTo(this.searchLabel, { xPercent: (!breakpoint.desktop ? -100 : 100) }, {
                xPercent: 0,
                duration: 0.6,
                clearProps: 'all',
                ease: 'power2.out',
            }, '-=.4');

        AudioPlayer.closeAudioPlayer();
    };



    private close = (): void => {
        if (this.isAnimating) return;

        this.isAnimating = true;
        this.isOpen = false;
        document.body.classList.remove('has-menu-open');

        // TEMP - js animation later
        if (Accessibility.isOn) this.isAnimating = false;
    };
}
