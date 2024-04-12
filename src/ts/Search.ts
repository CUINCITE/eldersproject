import { gsap } from 'gsap/dist/gsap';
import { easing } from './Site';
import { API, IApiData } from './widgets/API';
// import Widgets from 'widgets/All';
import { PushStates } from './PushStates';
import { Templates, TemplateNames } from './templates/Templates';
import * as Utils from './Utils';

export interface ISearchSettings {
    liveMinLen?: number;
    timeout?: number;
}


export class Search {

    private settings: ISearchSettings;
    private toggleButtons: NodeListOf<HTMLElement>;
    private searchBg: HTMLElement;
    private searchContent: HTMLElement;
    private btnClose: HTMLElement;
    private live: HTMLElement;
    private input: HTMLInputElement;
    private form: HTMLFormElement;
    private liveList: HTMLElement;
    private liveBottom: HTMLElement;
    private liveLi: NodeListOf<HTMLElement>;
    private isLiveShown: boolean;
    private timer;
    private liveTemplate;
    private isOpen: boolean;
    private allLink: HTMLElement;

    // eslint-disable-next-line no-unused-vars
    constructor(protected view: HTMLElement) {
        this.init();
    }


    public onState(): void {
        this.onFormReset();
        clearTimeout(this.timer);
    }


    private init(): void {
        this.settings = {
            liveMinLen: 3,
            timeout: 250,
        };

        this.searchBg = this.view.querySelector('.js-search-bg');
        this.searchContent = this.view.querySelector('.js-search-content');
        this.btnClose = document.querySelector('.js-search-close');
        this.input = this.view.querySelector('#search-inp');
        this.form = this.view.querySelector('.js-form');
        this.live = this.view.querySelector('.js-livesearch');
        this.liveTemplate = Templates.get(TemplateNames.LIVESEARCH);

        this.input.addEventListener('keyup', this.onType);

        this.bind();
    }



    private bind(): void {
        this.form.addEventListener('reset', this.onFormReset);
        this.form.addEventListener('submit', this.onFormSubmit);
    }



    private onFormReset = (): void => {
        this.input.value = '';
        this.animationHide();
        this.view.classList.remove('has-value');
    };



    private onFormSubmit = (e): void => {
        e.preventDefault();
        const pathname = this.form.getAttribute('action') || window.location.pathname;
        const params = Utils.getQueryString(this.form);

        PushStates.goTo(`${pathname}?${params}`);
    };



    private onType = (e): void => {
        e.preventDefault();

        const { value } = this.input;

        this.view.classList.toggle('has-value', value.length > 0);

        if (value.length < this.settings.liveMinLen) {
            this.animationHide();
            return;
        }

        clearTimeout(this.timer);
        this.timer = setTimeout(() => {

            const formData: IApiData = { url: this.form.getAttribute('data-api-url') };

            API.callIt(formData, this.form, (data, el, response) => {
                this.liveResponse(data, el, response);
            });


        }, this.settings.timeout);
    };



    private liveResponse(data, el, response): void {
        if (response.results && document.body.classList.contains('has-menu-open')) {
            this.live.innerHTML = this.liveTemplate.render(response);
            // this.trigger(ComponentEvents.CHANGE, this.live);
            this.showLiveResults();
            PushStates.bind(this.live);
            // Widgets.bind(this.live);
        } else {
            this.quickHide();
        }
    }



    private showLiveResults(): void {
        this.view.classList.add('is-livesearch-shown');
        this.liveList = this.view.querySelector('.js-livesearch-list');
        this.liveLi = this.view.querySelectorAll('.js-livesearch-item');
        this.allLink = this.view.querySelector('.js-livesearch-all');

        const tl = gsap.timeline();

        tl.to(this.liveList.parentElement, {
            duration: !this.isLiveShown ? 0.8 : 0,
            // height,
            ease: easing,
        })
            .fromTo(
                this.liveLi,
                { y: this.isLiveShown ? 0 : window.innerHeight },
                {
                    y: 0,
                    duration: 0.9,
                    stagger: 0.1,
                    ease: easing,
                },
            );

        this.allLink && tl.fromTo(
            this.allLink,
            {
                opacity: this.isLiveShown ? 1 : 0,
                yPercent: this.isLiveShown ? 0 : 100,
            },
            {
                opacity: 1,
                yPercent: 0,
                duration: 0.5,
                ease: easing,
            },
        );

        this.isLiveShown = true;
    }



    private quickHide(): void {
        if (!this.liveList) return;
        this.view.classList.remove('is-livesearch-shown');

        gsap.to(this.liveList.parentElement, {
            height: 0,
            duration: 0.01,
            delay: 0.8,
            onComplete: () => {
                this.input.value = '';
                this.live.innerHTML = '';
            },
        });
    }



    private animationHide(): void {
        console.log('Search animationHide ?');
        if (!this.isLiveShown) return;
        console.log('Search animationHide !');


        // hide 'all' link before hiding all li's
        gsap.to(this.allLink, {
            opacity: 0,
            duration: 0.4,
            ease: easing,
        });
        [...this.liveLi].reverse().forEach((item, index) => {
            gsap.to(item, {
                y: window.innerHeight,
                rotate: index % 2 === 0 ? 15 : -15,
                duration: 0.8,
                delay: index * 0.1,
                ease: easing,
                onComplete: () => {
                    console.log('Search animationHide !!!');
                    item.remove();
                    // after all tweens
                    if (index === this.liveLi.length - 1) {
                        gsap.set(this.liveList.parentElement, { height: 0 });
                        this.live.innerHTML = '';
                    }
                    this.view.classList.remove('is-livesearch-shown');
                },
            });
        });

        if (!this.liveLi.length) {
            this.live.innerHTML = '';
            this.view.classList.remove('is-livesearch-shown');
        }


        this.isLiveShown = false;
    }
}
