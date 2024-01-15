import { gsap } from 'gsap/dist/gsap';
import { easing } from '../../Site';
import { Component } from '../../components/Component';


export class LightboxNav extends Component {

    private navButtons: NodeListOf<HTMLButtonElement>;
    private navTabs: NodeListOf<HTMLElement>;
    private activeTab: HTMLElement;
    private lightboxEl: HTMLElement;

    constructor(protected view: HTMLElement) {
        super(view);

        this.lightboxEl = document.getElementById('lightbox');
        this.navButtons = this.view.querySelectorAll('button');
        this.navTabs = document.querySelectorAll('.js-lightbox-tab');

        this.bind();
    }



    private bind = (): void => {
        [...this.navButtons].forEach(btn => btn.addEventListener('click', this.onBtnClick));
    };



    private onBtnClick = (e): void => {
        const { currentTarget: button } = e;

        const tabSlug: string = button.getAttribute('aria-controls');
        const tabToOpen: HTMLElement = [...this.navTabs].find(tab => tab.id === tabSlug);

        this.showTab(tabToOpen);

        [...this.navButtons].forEach(btn => {
            btn.classList.remove('is-active');
            btn.setAttribute('aria-selected', 'false');
        });
        button.classList.add('is-active');
        button.setAttribute('aria-selected', 'true');
    };



    private showTab = (tab: HTMLElement): void => {
        this.closeTab(this.activeTab).then(() => {
            if (!tab) {
                // for animate image
                this.lightboxEl.classList.add('is-default');
                this.lightboxEl.classList.remove('is-not-default');
                this.activeTab = null;
                return;
            }
            gsap.fromTo(tab, { yPercent: 100 }, {
                yPercent: 0,
                duration: 0.6,
                ease: easing,
                clearProps: 'all',
                onStart: () => tab.classList.add('is-visible'),
                onComplete: () => {
                    this.activeTab = tab;
                },
            });
        });
    };



    private closeTab = (tab: HTMLElement): Promise<void> => new Promise(resolve => {
        if (!tab) {
            // for animate image
            this.lightboxEl.classList.add('is-not-default');
            this.lightboxEl.classList.remove('is-default');
            resolve();
        } else {
            gsap.fromTo(tab, { yPercent: 0 }, {
                yPercent: 100,
                duration: 0.3,
                ease: easing,
                clearProps: 'all',
                onComplete: () => {
                    tab.classList.remove('is-visible');
                    resolve();
                },
            });
        }
    });
}
