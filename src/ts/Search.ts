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

    // eslint-disable-next-line no-unused-vars
    constructor(protected view: HTMLElement) {
        this.init();
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
        if (response.results) {
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

        // set max-height of livesearch wrap - prevent growing outside viewport
        const height = Math.min(this.liveList.clientHeight, window.innerHeight * 0.75);

        gsap.timeline()
            .to(this.liveList.parentElement, {
                duration: !this.isLiveShown ? 0.8 : 0,
                height,
                ease: easing,
            })
            .fromTo(
                this.liveLi,
                {
                    opacity: 0,
                    y: 40,
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.15,
                    ease: easing,
                },
            );

        this.isLiveShown = true;
    }



    private quickHide(): void {
        if (!this.liveList) return;
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
        this.isLiveShown && gsap.timeline()
            .to(this.liveLi, {
                opacity: 0,
                y: 40,
                duration: 0.6,
                stagger: 0.1,
                ease: easing,
            }, 0)
            .to(this.liveList.parentElement, {
                height: 0,
                duration: 0.4,
                ease: easing,
            });


        this.isLiveShown = false;
    }
}
