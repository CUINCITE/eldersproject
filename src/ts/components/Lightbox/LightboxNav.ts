import { gsap } from 'gsap/dist/gsap';
import { breakpoint, easing } from '../../Site';
import { Component } from '../../components/Component';
import { ISwipeCoordinates, Swipe, SwipeDirections, SwipeEvents } from '../Swipe';


export class LightboxNav extends Component {

    private navButtons: NodeListOf<HTMLButtonElement>;
    private navTabs: NodeListOf<HTMLElement>;
    private activeTab: HTMLElement;
    private lightboxEl: HTMLElement;
    private isAnimating: boolean;
    private swipeComp: Swipe;
    private indicator: HTMLElement;

    constructor(protected view: HTMLElement, lightboxEl: HTMLElement) {
        super(view);

        this.lightboxEl = lightboxEl;
        this.navButtons = this.view.querySelectorAll('button');
        this.navTabs = document.querySelectorAll('.js-lightbox-tab');
        this.indicator = this.view.querySelector('.js-nav-indicator');

        this.bind();
    }


    public hide = (): void => {
        this.activeTab && this.closeTab(this.activeTab);
    };



    private bind = (): void => {
        [...this.navButtons].forEach(btn => btn.addEventListener('click', this.onBtnClick));

        if (!breakpoint.desktop) {
            this.swipeComp = new Swipe(this.view, { horizontal: false, vertical: true });

            this.swipeComp.on(SwipeEvents.END, (e: ISwipeCoordinates) => {

                switch (e.direction) {
                    case SwipeDirections.UP:
                        this.lightboxEl.classList.add('is-expanded');
                        break;
                    case SwipeDirections.DOWN:
                        this.lightboxEl.classList.remove('is-expanded');
                        break;
                    default:
                        console.warn('no direction');
                }
            });
        }
    };



    private onBtnClick = (e): void => {
        if (this.isAnimating) return;

        const { currentTarget: button } = e;

        const tabSlug: string = button.getAttribute('aria-controls');
        const tabToOpen: HTMLElement = [...this.navTabs].find(tab => tab.id === tabSlug);

        this.showTab(tabToOpen);

        this.updateIndicator(button);

        [...this.navButtons].forEach(btn => {
            btn.classList.remove('is-active');
            btn.setAttribute('aria-selected', 'false');
        });
        button.classList.add('is-active');
        button.setAttribute('aria-selected', 'true');
    };



    private updateIndicator = (button: HTMLElement): void => {
        if (!button) return;

        const { offsetTop, clientHeight } = button;
        const y = offsetTop + ((clientHeight - this.indicator.clientHeight) / 2);

        gsap.to(this.indicator, { y, duration: 0.3, ease: easing });
    };



    private showTab = (tab: HTMLElement): void => {
        if (this.isAnimating) return;

        this.closeTab(this.activeTab).then(() => {
            if (!tab) {
                // for animate intro
                this.lightboxEl.classList.add('is-default');
                this.lightboxEl.classList.remove('is-not-default');
                this.activeTab = null;
                this.trigger('navUpdate', null);
                return;
            }
            gsap.fromTo(tab, { yPercent: 100 }, {
                yPercent: 0,
                duration: 0.6,
                ease: easing,
                onStart: () => {
                    gsap.set(tab, { y: 0, yPercent: 100 });
                    this.isAnimating = true;
                    tab.classList.add('is-visible');
                },
                onComplete: () => {
                    this.isAnimating = false;
                    this.activeTab = tab;
                    this.trigger('navUpdate', this.activeTab);
                    gsap.set(tab, { y: 0, yPercent: 0 });
                },
            });
        });
    };



    private closeTab = (tab: HTMLElement): Promise<void> => new Promise(resolve => {
        if (this.isAnimating) resolve();

        if (!tab) {
            // for animate intro
            this.lightboxEl.classList.add('is-not-default');
            this.lightboxEl.classList.remove('is-default');
            resolve();
        } else {
            gsap.fromTo(tab, { yPercent: 0 }, {
                yPercent: 100,
                duration: 0.3,
                ease: easing,
                onStart: () => {
                    this.isAnimating = true;
                },
                onComplete: () => {
                    this.isAnimating = false;
                    tab.classList.remove('is-visible');
                    gsap.set(tab, { y: 0, yPercent: 100 });
                    resolve();
                },
            });
        }
    });
}
