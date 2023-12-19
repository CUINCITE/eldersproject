import { Component } from './Component';


export class AccordeonList extends Component {
    private allItems: HTMLLIElement[];

    constructor(protected view: HTMLElement) {
        super(view);
        this.bind();
        this.setupListeners();
    }

    private bind(): void {
        this.allItems = [...this.view.querySelectorAll('.js-accordeon-item')].map(el => {
            this.setHeight(el);
            const element = <HTMLLIElement>el;
            return element;
        });
    }

    private setupListeners(): void {
        const { closeOthers } = this.view.dataset;

        this.allItems.forEach(item => {
            const button = item.querySelector('.js-accordeon-button');
            button && button.addEventListener('click', e => this.onToggleClick(e, item));

            closeOthers && this.setupMutationObserver(item);
        });
    }

    private setupMutationObserver(item): void {
        const link = item.querySelector('a.button');

        if (link) {
            this.onLinkToggle(item.classList.contains('is-closed'), link);
            const observer = new MutationObserver(() => this.onLinkToggle(item.classList.contains('is-closed'), link));
            observer.observe(item, { attributes: true });
        }
    }

    private onToggleClick = (e, item) => {
        e.preventDefault();
        e.stopPropagation();

        if (item.classList.contains('is-closed')) {
            this.allItems.forEach(itemToclose => {
                this.close(itemToclose);
            });

            this.open(item);
        } else {
            this.close(item);
        }
    };

    private onLinkToggle = (isClosed, element) => {
        element.tabIndex = isClosed ? -1 : 0;
    };

    private close(item): void {
        item.classList.add('is-closed');
    }

    private open(item): void {
        item.classList.remove('is-closed');
    }

    private setHeight(item): void {
        const copy: HTMLDivElement = item.querySelector('.js-accordeon-copy');

        if (copy) {
            copy.removeAttribute('style');
            copy.style.height = `${copy.scrollHeight}px`;
        }
    }
}
