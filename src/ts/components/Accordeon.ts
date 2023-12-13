import { Component } from './Component';
import { breakpoint } from '../Site';


export class Accordeon extends Component {
    private isOpen = false;


    constructor(protected view: HTMLElement) {
        super(view);
        this.bind();
        this.setHeight();
    }

    private bind(): void {
        const button = this.view.querySelector('.js-accordeon-button');
        button && this.view.addEventListener('click', this.onToggleClick);
    }

    private onToggleClick = e => {
        e.preventDefault();
        e.stopPropagation();
        if (!this.isOpen) {
            this.open();
        } else {
            this.close();
        }
    };

    private close(): void {
        this.isOpen = false;
        this.view.classList.add('is-closed');
    }

    private open(): void {
        this.isOpen = true;
        this.view.classList.remove('is-closed');
    }

    private setHeight(): void {
        const copy: HTMLDivElement = this.view.querySelector('.js-accordeon-copy');

        if (copy) {
            copy.removeAttribute('style');
            copy.style.height = `${copy.scrollHeight}px`;
        }
    }
}
