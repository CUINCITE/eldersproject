import { Component } from './Component';


export class Accordeon extends Component {

    constructor(protected view: HTMLElement) {
        super(view);
        this.bind();
        this.setHeight();
    }

    private bind(): void {
        const button = this.view.querySelector('.js-accordeon-button');
        button && button.addEventListener('click', this.onToggleClick);
    }

    private onToggleClick = e => {
        e.preventDefault();
        e.stopPropagation();
        this.view.classList.toggle('is-closed');
    };

    private setHeight(): void {
        const copy: HTMLDivElement = this.view.querySelector('.js-accordeon-copy');

        if (copy) {
            copy.removeAttribute('style');
            copy.style.height = `${copy.scrollHeight}px`;
        }
    }
}
