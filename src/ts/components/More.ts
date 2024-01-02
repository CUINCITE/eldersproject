import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { Component, ComponentEvents } from '../components/Component';
import { easing } from '../Site';
import { PushStates } from '../PushStates';


export interface IMoreSettings {
    contentSelector?: string;
    itemSelector?: string;
    infinite?: boolean;
    updateURL?: boolean;
}

export class More extends Component {


    private settings: IMoreSettings;
    private contentEl: HTMLElement;
    private pending: boolean;
    private scrollTrigger: ScrollTrigger;
    private linkEl: HTMLAnchorElement;



    constructor(protected view: HTMLElement) {
        super(view);

        this.linkEl = (this.view.nodeName === 'A') ? this.view as HTMLAnchorElement : this.view.querySelector('a');

        this.settings = {
            itemSelector: 'li',
            infinite: false,
            updateURL: false,
            ...JSON.parse(this.view.dataset.options),
        };

        this.contentEl = document.querySelector(this.settings.contentSelector);

        // check must-have options:
        console.assert(!!this.contentEl, 'There is no wrap element to load more content!', true);

        if (!this.contentEl) {
            this.view.style.display = 'none';
            return;
        }

        // bind click:
        this.linkEl.addEventListener('click', this.onClick);

        // bind infinite scroll:
        if (this.settings.infinite) {
            this.scrollTrigger = ScrollTrigger.create({
                trigger: this.view,
                start: 'bottom bottom',
            });
        }
    }



    public destroy(): void {
        this.scrollTrigger?.kill();
        super.destroy();
    }



    private async load(): Promise<void> {

        if (this.pending) return;

        const url = this.linkEl.href;
        const tie = url.indexOf('?') < 0 ? '?' : '&';
        const params = new URLSearchParams({ partial: 'true' });

        this.pending = true;
        this.view.classList.add('is-doing-request');

        this.settings.updateURL && PushStates.changePath(url);

        // send API request
        fetch(url + tie + params, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'text/html',
            },
        })
            .then(response => response.text())
            .then(response => {
                const selector = this.settings.contentSelector;

                // mark existing items to not animate them later
                const existingItems = this.contentEl.querySelectorAll(this.settings.itemSelector);
                [...existingItems].map(i => i.classList.add('is-existing'));

                // store current height
                const height = this.contentEl.clientHeight;

                // add new html from response to content element
                const newDiv = document.createElement('div');
                newDiv.innerHTML = response;
                const elLoadedContent = newDiv.querySelector(selector).innerHTML;
                this.contentEl.insertAdjacentHTML('beforeend', elLoadedContent);

                // Update button
                const id = this.view.getAttribute('id');
                const newButton: HTMLLinkElement = newDiv.querySelector(id ? `#${id}` : '[data-component="More"]');
                const newURL = newButton?.getAttribute('href');
                if (newButton && newURL !== '') {
                    this.view.setAttribute('href', newURL);
                    this.scrollTrigger?.refresh();
                } else {
                    this.view.remove();
                    this.scrollTrigger?.kill();
                }

                this.trigger(ComponentEvents.CHANGE, this.contentEl);

                // new items' animation - excluding items that were added to content earlier
                const items = this.contentEl.querySelectorAll(`${this.settings.itemSelector}:not(.is-existing)`);
                const tl = gsap.timeline();
                [...items].forEach((item, index) => {
                    tl.from(item, { opacity: 0, duration: 0.5, y: 50, ease: easing }, index * 0.1);
                });

                // animate height
                gsap.fromTo(this.contentEl, { height }, {
                    height: 'auto',
                    duration: 0.4,
                    ease: easing,
                });
            })
            .catch(error => {
                console.warn(`error: ${error}`, error);
            })
            .finally(() => {
                this.view.classList.remove('is-doing-request');
                setTimeout(() => {
                    this.pending = false;
                }, 250);
            });
    }



    private onClick = (e: Event): void => {
        e.preventDefault();
        e.stopPropagation();
        this.load();
    };
}
