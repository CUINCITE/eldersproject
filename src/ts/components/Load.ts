import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { interviews } from '../animations/scroll/interviews';
import * as Utils from '../Utils';
import { Component, ComponentEvents } from './Component';
import { PushStates } from '../PushStates';
import { FilterLetters } from './FilterLetters';
import { components } from '../Classes';

interface ILoadSettings {
    contentSelector?: string;
    live?: boolean; // live reload on form change events
    extra?: string; // additional form to parse
    extraMobile?: string; // additional mobile form to parse instead of extra
    total?: string; // updating total value on filters' change
    filtered?: string; // show filtered items' list
    scrollTo?: string; // scroll to given element when reloading filters
    updateCurrentSorting?: boolean // manually updates currently selected sorting on mobile
    externalLinks?: string; // external links with [data-filters] attribute to reload filters
    setStorage?: boolean; // set storage item with current view (grid/list view)
}


/* This can be used on form or any other element
 * to load html data to specified container */

export class Load extends Component {

    private isForm: boolean;
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
    private components: Array<Component>;
    private section: HTMLElement;
    private content: HTMLElement;
    private storageSlug = 'interviewsView';



    constructor(protected view: HTMLElement) {
        super(view);

        this.settings = {
            contentSelector: '.js-load-content',
            live: false,
        };


        this.settings = Object.assign(this.settings, JSON.parse(this.view.getAttribute('data-options')));

        this.isForm = this.view.tagName === 'FORM';
        this.isContentHidden = false;
        this.contentElement = document.querySelector(this.settings.contentSelector);
        this.viewsButtons = this.view.querySelectorAll('[data-view]');
        this.resetButton = this.view.querySelector('.js-reset');
        this.section = document.getElementById('interviews');
        this.content = document.getElementById('interviews-grid');

        if (this.settings.total) this.totalElement = this.view.querySelector(this.settings.total);
        if (this.settings.filtered) this.filteredEl = document.querySelector(this.settings.filtered);

        this.settings.setStorage && this.checkStorage();
        this.updateFiltered();
        this.bind();

        // bind external links with [data-filter] attribute to reload filters
        // this.settings.externalLinks && this.bindExternalFilters();

    }



    public destroy(): void {
        super.destroy();
    }



    protected bind(): void {

        if (this.isForm) {
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
        } else {
            // for <a> elements
            this.view.addEventListener('click', e => {
                e.preventDefault();
                const url = (this.view as HTMLAnchorElement).href;
                this.reloadFilters(url, true);
            });
        }

    }



    protected bindExternalFilters(): void {
        const externalFilters: NodeListOf<HTMLAnchorElement> = document.querySelectorAll('a[data-filters]');

        [...externalFilters].forEach(el => {
            el.addEventListener('click', e => {
                e.preventDefault();
                const url = el.href;
                this.reloadFilters(url);
            });
        });
    }



    protected hideContent(duration = 0.25): Promise<void> {

        return new Promise<void>(resolve => {
            if (!this.isContentHidden) {
                gsap.to(this.contentElement, {
                    opacity: 0,
                    duration,
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
        FilterLetters.checkButtons();

        gsap.fromTo(this.contentElement, { opacity: 0 }, {
            opacity: 1,
            duration: 0.5,
            ease: 'sine',
        });
    };



    protected onViewBtnClick = (e): void => {
        const { currentTarget: button } = e;
        const { view } = button.dataset;

        Utils.setStorageItem(this.storageSlug, view);

        this.hideContent().then(() => {
            this.toggleView(view);
        }).then(this.showContent);
    };



    protected checkStorage = (): void => {
        const view = Utils.getStorageItem(this.storageSlug);
        view && this.toggleView(view);
    };



    protected toggleView = (view: string): void => {
        this.contentElement.classList.remove('is-list-view', 'is-grid-view');
        this.contentElement.classList.add(`is-${view}-view`, 'is-after-toggle');
        this.section?.classList.remove('is-list', 'is-grid');
        this.section?.classList.add(`is-${view}`);

        setTimeout(() => {
            // temp class to prevent transition on toggle
            this.contentElement.classList.remove('is-after-toggle');
        }, 100);
    };



    protected load(url): Promise<void> {
        if (!!this.isPending || !!this.isFinished) { return; }

        window.clearTimeout(this.liveTimeout);
        this.isPending = true;
        this.view.classList.add('is-pending');
        PushStates.changePath(url, true);

        if (this.settings.filtered) this.updateFiltered();


        if (this.settings.scrollTo && this.view.hasAttribute('data-filters')) {
            window.scrollTo({
                top: document.body.getBoundingClientRect().top + window.scrollY,
                behavior: 'smooth',
            });
        }

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
                // with this flag enabled, scrolltrigger is refreshed in other function
                !this.settings.scrollTo && ScrollTrigger.refresh();

                // should have lightbox links
                PushStates.bind(this.contentElement);
                this.bindExternalFilters();

                this.buildComponents(this.contentElement.querySelectorAll('[data-component]'));

                setTimeout(() => {
                    this.isPending = false;
                }, 250);
            });
    }



    private buildComponents(componentsList: NodeList): void {
        this.components = [];

        this.components = [...componentsList].map(el => {
            const element = <HTMLElement>el;
            const name = element.dataset.component;
            if (name !== undefined && components[name]) {
                let options: Object = {};
                if (element.dataset.options) {
                    options = JSON.parse(element.dataset.options);
                }
                const component = new components[name](element, options);
                return component;
            }
            window.console.warn('There is no `%s` component!', name);
            return null;
        }).filter(Boolean);
    }



    private onSubmit = (e?): void => {

        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        let loadPath = this.view.getAttribute('action') || this.view.dataset.api || window.location.pathname;

        const extraForms = this.settings.extra ? ([...document.querySelectorAll(this.settings.extra)] as HTMLFormElement[]) : null;
        const formData = Utils.getQueryString([...extraForms, this.view as HTMLFormElement]);

        if (formData) {
            loadPath += `?${formData}`;
        }


        this.reloadFilters(loadPath);
    };



    private reloadFilters = (path: string, reloadPin = false): void => {
        Promise.all([this.hideContent(), this.load(path)]).then(() => {
            this.showContent();
            reloadPin && setTimeout(() => {
                const panel = document.querySelector('.js-panel-wrapper');
                panel && interviews(panel);
            }, 1100);
        });
    };



    private updateFiltered = (): void => {
        // updating on front side because response is always in html

        if (!this.filteredEl) return;

        // always find inputs in main form with filters, sometimes it's executed in outer form
        const selectedInputs: HTMLInputElement[] = [...document.getElementById('main-form').querySelectorAll('input')].filter(input => input.checked);
        const filteredItems = selectedInputs.map(input => {
            const count = input.dataset.count ? `<span>${input.dataset.count}</span>` : '';
            // eslint-disable-next-line max-len
            return `<li class="filtered__label"><label for="${input.id}">${input.dataset.name}${count} <i class="icon-close"></i></label></li>`;
        });
        this.filteredEl.innerHTML = filteredItems.join('');

        setTimeout(() => {
            this.bindFiltered();
        }, 50);
    };



    private bindFiltered = (): void => {
        // when live=true, there's no need to trigger submit manually - form submits on each change
        if (this.settings.live) return;

        // force form submit on each filtered label click
        [...this.filteredEl.querySelectorAll('label')].forEach(label => {
            label.addEventListener('click', () => {
                // submit needs to be triggered manually for closing modal on submit event
                setTimeout(() => this.view.dispatchEvent(new Event('submit')), 10);
            });
        });
    };



    private onReset = (e): void => {
        e.preventDefault();
        [...this.view.querySelectorAll('input')].forEach(input => {
            input.checked = false;
        });
    };
}
