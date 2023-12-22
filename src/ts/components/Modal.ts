import { Component } from './Component';
import Scroll from '../Scroll';


export class Modal extends Component {

    private triggerBtn: HTMLButtonElement;
    private closerBtn: HTMLButtonElement;
    private form: HTMLFormElement;
    private isOpen = false;

    constructor(protected view: HTMLElement) {
        super(view);

        this.triggerBtn = document.querySelector(`[aria-controls="${this.view.id}"]`);
        this.closerBtn = this.view.querySelector('.js-modal-close');
        this.form = this.view.querySelector('form');

        this.bind();
    }



    protected bind(): void {
        this.triggerBtn && this.triggerBtn.addEventListener('click', this.onTriggerClick);
        this.form && this.form.addEventListener('submit', this.close);
        this.closerBtn && this.closerBtn.addEventListener('click', this.close);
    }



    private onTriggerClick = (): void => {
        this.isOpen ? this.close() : this.open();
    };



    private close = (): void => {
        this.view.classList.remove('is-open');
        this.isOpen = false;
    };



    private open = (): void => {
        this.view.classList.add('is-open');
        this.isOpen = true;
        Scroll.scrollTo({
            el: this.view,
            duration: 0.75,
            ease: 'sine.out',
            offsetY: this.view.parentElement.clientHeight,
        });
    };
}
