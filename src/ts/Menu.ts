import { gsap } from 'gsap/dist/gsap';
import { AudioPlayer } from './components/AudioPlayer';

export class Menu {
    private isOpen = false;

    private elToggle: HTMLElement;
    private closeBtn: HTMLButtonElement;
    private wrapEl: HTMLElement;
    private isAnimating = false;
    private items: NodeListOf<HTMLElement>;
    private lines: NodeListOf<HTMLElement>;
    private labels: NodeListOf<HTMLElement>;
    private links: NodeListOf<HTMLElement>;
    private searchLabel: HTMLElement;
    private searchIcon: HTMLElement;


    // eslint-disable-next-line no-unused-vars
    constructor(protected view: HTMLElement) {
        this.elToggle = document.querySelector('.js-toggle-menu');
        this.closeBtn = this.view.querySelector('.js-menu-close');
        this.wrapEl = document.getElementById('wrapper');
        this.items = this.view.querySelectorAll('.js-menu-item');
        this.labels = this.view.querySelectorAll('.js-menu-label');
        this.lines = this.view.querySelectorAll('.js-menu-line');
        this.links = this.view.querySelectorAll('.js-menu-link');
        this.searchLabel = this.view.querySelector('.js-menu-search-label');
        this.searchIcon = this.view.querySelector('.js-menu-search-svg');

        this.bind();
    }



    public onState(): void {
        this.isOpen && this.close();
    }



    private bind(): void {
        this.elToggle && this.elToggle.addEventListener('click', this.onToggle);
        this.closeBtn && this.closeBtn.addEventListener('click', this.close);

        // on close menu animation's end (related to whole #content toggle animation) set display: none for menu
        this.wrapEl.addEventListener('transitionend', () => {
            this.onAnimationEnd();
        });
    }



    private onAnimationEnd = (): void => {
        this.isAnimating = false;
        if (!this.isOpen) {
            this.view.style.display = 'none';
        }
    };



    private onToggle = (): void => {
        this.isOpen ? this.close() : this.open();
    };



    private open = (): void => {
        if (this.isAnimating) return;

        this.isAnimating = true;
        this.isOpen = true;
        this.view.style.display = 'flex';
        document.body.classList.add('has-menu-open');

        gsap.timeline()
            .addLabel('init')
            .fromTo(this.labels, { yPercent: 120 }, {
                yPercent: 0,
                duration: 0.8,
                stagger: 0.25,
                ease: 'power2.out',
            }, 'init')
            .fromTo(this.lines, { scaleX: 0 }, {
                scaleX: 1,
                duration: 1.2,
                stagger: 0.25,
                ease: 'power2.out',
            }, 'init')
            .fromTo(this.links, { xPercent: 100 }, {
                xPercent: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power2.out',
            }, '-=.8')
            .fromTo(this.searchIcon, { scale: 0 }, {
                scale: 1,
                duration: 0.4,
                ease: 'power2.out',
            }, '-=.4')
            .fromTo(this.searchLabel, { xPercent: 100 }, {
                xPercent: 0,
                duration: 0.6,
                clearProps: 'all',
                ease: 'power2.out',
            }, '-=.25');

        AudioPlayer.closeAudioPlayer();
    };



    private close = (): void => {
        if (this.isAnimating) return;

        this.isAnimating = true;
        this.isOpen = false;
        document.body.classList.remove('has-menu-open');
    };
}
