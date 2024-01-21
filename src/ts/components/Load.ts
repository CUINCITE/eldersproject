import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import Scroll from '../Scroll';
import * as Utils from '../Utils';
import { Component, ComponentEvents } from './Component';
import { PushStates } from '../PushStates';

interface ILoadSettings {
    contentSelector?: string;
    live?: boolean; // live reload on form change events
    extra?: string; // additional form to parse
    extraMobile?: string; // additional mobile form to parse instead of extra
    total?: string; // updating total value on filters' change
    filtered?: string; // show filtered items' list
    scrollTo?: string; // scroll to given element when reloading filters
}


/* This can be used on form or any other element
 * to load html data to specified container */

export class Load extends Component {

    private isPending = false;
    private isFinished = false;
    private settings: ILoadSettings;
    private isContentHidden: boolean;
    private contentElement: HTMLElement;
    private totalElement: HTMLElement;
    private liveTimeout;
    private viewsButtons: NodeListOf<HTMLButtonElement>;
    private filteredEl: HTMLElement;
    private resetButton: HTMLButtonElement;



    constructor(protected view: HTMLElement) {
        super(view);

        this.settings = {
            contentSelector: '.js-load-content',
            live: false,
        };


        this.settings = Object.assign(this.settings, JSON.parse(this.view.getAttribute('data-options')));

        this.isContentHidden = false;
        this.contentElement = document.querySelector(this.settings.contentSelector);
        this.viewsButtons = this.view.querySelectorAll('[data-view]');
        this.resetButton = this.view.querySelector('.js-reset');

        if (this.settings.total) this.totalElement = this.view.querySelector(this.settings.total);
        if (this.settings.filtered) this.filteredEl = document.querySelector(this.settings.filtered);

        this.updateFiltered();
        this.bind();
    }



    public destroy(): void {
        super.destroy();
    }



    protected bind(): void {

        this.view.addEventListener('submit', this.onSubmit);

        if (this.settings.live) {
            [...this.view.querySelectorAll('input, select')].forEach(el => {
                el.addEventListener('change', () => {
                    window.clearTimeout(this.liveTimeout);
                    this.liveTimeout = setTimeout(() => this.view.dispatchEvent(new Event('submit')), 10);
                });
            });
        }

        [...this.viewsButtons].forEach(btn => btn.addEventListener('click', this.onViewBtnClick));
        this.resetButton && this.resetButton.addEventListener('click', this.onReset);
    }



    protected hideContent(): Promise<void> {

        return new Promise<void>(resolve => {
            if (!this.isContentHidden) {
                gsap.to(this.contentElement, {
                    opacity: 0,
                    duration: 0.25,
                    ease: 'sine',
                    onComplete: (): void => {
                        this.isContentHidden = true;
                        resolve();
                    },
                });
            } else {
                resolve();
            }
        });
    }



    protected showContent = (): void => {
        this.isContentHidden = false;
        gsap.fromTo(this.contentElement, { opacity: 0 }, {
            opacity: 1,
            duration: 0.45,
            ease: 'sine',
        });
    };



    protected onViewBtnClick = (e): void => {
        const { currentTarget: button } = e;
        const { view } = button.dataset;
        this.hideContent().then(() => {
            this.contentElement.classList.remove('is-list-view', 'is-grid-view');
            this.contentElement.classList.add(`is-${view}-view`);
        }).then(this.showContent);
    };



    protected load(url): Promise<void> {
        if (!!this.isPending || !!this.isFinished) { return; }

        window.clearTimeout(this.liveTimeout);
        this.isPending = true;
        this.view.classList.add('is-pending');
        PushStates.changePath(url, true);
        ScrollTrigger.refresh();

        if (this.settings.filtered) this.updateFiltered();
        if (this.settings.scrollTo) this.scrollToContainer();

        // eslint-disable-next-line consistent-return
        return fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'text/html' },
        })
            .then(response => response.text())
            .then(response => {
                const selector = this.settings.contentSelector;
                const newDiv = document.createElement('div');
                newDiv.innerHTML = response;
                const elLoadedContent = newDiv.querySelector(selector).innerHTML;
                this.contentElement.innerHTML = elLoadedContent;


                // update total in filters
                if (this.settings.total) {
                    const total = newDiv.querySelector(this.settings.total).innerHTML;
                    this.totalElement.innerHTML = total;
                }


                this.trigger(ComponentEvents.CHANGE, this.contentElement);
            })
            .catch(error => {
                console.warn(`error: ${error}`, error);
            })
            .finally(() => {
                this.view.classList.remove('is-pending');
                ScrollTrigger.refresh();

                // should have lightbox links
                PushStates.bind(this.contentElement);

                setTimeout(() => {
                    this.isPending = false;
                }, 250);
            });
    }


    private onSubmit = (e?): void => {

        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        let loadPath = this.view.getAttribute('action') || this.view.dataset.api || window.location.pathname;

        let extraForms = this.settings.extra ? ([...document.querySelectorAll(this.settings.extra)] as HTMLFormElement[]) : null;
        const extraFormsMobile = this.settings.extraMobile
            ? ([...document.querySelectorAll(this.settings.extraMobile)] as HTMLFormElement[])
            : null;

        if (extraFormsMobile && window.matchMedia('(orientation: portrait) and (max-width: 659px)').matches) {
            extraForms = extraFormsMobile;
        }

        const formData = Utils.getQueryString([...extraForms, this.view as HTMLFormElement]);

        if (formData) {
            loadPath += `?${formData}`;
        }



        Promise.all([this.hideContent(), this.load(loadPath)]).then(() => {
            this.showContent();
        });
    };



    private updateFiltered = (): void => {
        // updating on front side because response is always in html

        if (!this.filteredEl) return;

        const selectedInputs: HTMLInputElement[] = [...this.view.querySelectorAll('input')].filter(input => input.checked);
        const filteredItems = selectedInputs.map(input => `
            <li class="filtered__label">
                <label for="${input.id}">${input.dataset.name}<i class="icon-close"></i></label>
            </li>`);
        this.filteredEl.innerHTML = filteredItems.join('');
        this.bindFiltered();
    };



    private bindFiltered = (): void => {
        // when live=true, there's no need to trigger submit manually - form submits on each change
        if (this.settings.live) return;

        // force form submit on each filtered label click
        [...this.filteredEl.querySelectorAll('label')].forEach(label => label.addEventListener('click', () => {
            // submit needs to be triggered manually for closing modal on submit event
            setTimeout(() => this.view.dispatchEvent(new Event('submit')), 10);
        }));
    };



    private scrollToContainer = (): void => {
        const elem = document.querySelector(this.settings.scrollTo) as HTMLElement;
        if (!elem) {
            console.error(`element ${this.settings.scrollTo} doesn't exist!`);
            return;
        }

        Scroll.scrollTo({
            el: elem,
            duration: 1,
        });
    };



    private onReset = (e): void => {
        e.preventDefault();
        [...this.view.querySelectorAll('input')].forEach(input => {
            input.checked = false;
        });
    };
}
