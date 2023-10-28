import { Component, ComponentEvents } from './Component';
import { PushStates } from '../PushStates';

export interface IMoreSettings {
    contentSelector?: string;
}


export class More extends Component {
    private pending = false;
    private finished = false;
    private settings: IMoreSettings;
    private contentEl: HTMLElement;


    constructor(protected view: HTMLLinkElement) {
        super(view);

        this.settings = {};
        this.settings = Object.assign(this.settings, JSON.parse(this.view.getAttribute('options')));
        this.contentEl = document.querySelector(this.settings.contentSelector);


        // check must-have options:
        console.assert(!!this.contentEl, 'There is no wrap element to load more content!', true);

        // bind click:
        if (this.contentEl) {
            this.view.addEventListener('click', this.onClickMore);
        } else {
            this.view.style.display = 'none';
        }

        if (this.view.matches('[data-scroll="infinite"]')) {
            document.body.classList.add('has-pending-infinite');
            this.view.classList.add('is-hidden');
            this.view.innerHTML = '';
        }
    }


    public destroy(): void {
        document.body.classList.remove('has-pending-infinite');
        super.destroy();
    }


    public load(): void {
        if (!!this.pending || !!this.finished) { return; }

        const url = this.view.href;

        this.pending = true;
        this.view.classList.add('is-doing-request');
        PushStates.changePath(url);

        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'text/html'
            },
        })
            .then(response => response.text())
            .then(response => {
                const selector = this.settings.contentSelector;
                const newDiv = document.createElement('div');
                newDiv.innerHTML = response;
                const elLoadedContent = newDiv.querySelector(selector).children;
                console.log(elLoadedContent);

                [...elLoadedContent].forEach(element => {
                    this.contentEl.append(element);
                });


                // update button:
                const elNewButton: HTMLLinkElement = newDiv.querySelector('[data-component="More"]');
                const newURL = elNewButton.getAttribute('href');

                if (elNewButton && newURL !== '') {
                    this.view.setAttribute('href', newURL);
                } else {
                    document.body.classList.remove('has-pending-infinite');
                    this.view.style.display = 'none';
                    this.finished = true;
                }

                window.dispatchEvent(new Event('resize'));

                this.trigger(ComponentEvents.CHANGE, this.contentEl);
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


    private onClickMore = (e: Event): void => {
        e.preventDefault();
        e.stopPropagation();
        this.load();
    };
}
