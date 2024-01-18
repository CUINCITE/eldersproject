import { gsap } from 'gsap/dist/gsap';
import { Component } from './Component';
import Scroll from '../Scroll';



export class Modal extends Component {

    private triggerBtn: HTMLButtonElement;
    private closerBtn: HTMLButtonElement;
    private form: HTMLFormElement;
    private isOpen = false;
    private tl: gsap.core.Timeline;

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



    private createTimeline = (): void => {
        const wrapper = this.view.querySelector('.js-modal-wrap');
        const bar: HTMLElement = this.view.querySelector('.js-modal-wrap-bar');

        if (!wrapper) return;

        this.tl = gsap.timeline({
            ease: 'none',
            scrollTrigger: {
                trigger: wrapper,
                scroller: this.view,
                invalidateOnRefresh: true,
                start: () => `top ${bar?.offsetHeight ?? 0}px`,
                onToggle: self => this.view.classList.toggle('is-scrolled', self.isActive),
            },
        });
    };



    private cleanupTimeline = (): void => {
        this.tl.kill();
        this.view.classList.remove('is-scrolled');
    };



    private onTriggerClick = (): void => {
        this.isOpen ? this.close() : this.open();
    };



    private close = (): void => {
        this.view.classList.remove('is-open');
        document.body.classList.remove('has-open-modal');
        this.isOpen = false;
        this.cleanupTimeline();
    };



    private open = (): void => {
        this.view.classList.add('is-open');
        document.body.classList.add('has-open-modal');
        this.isOpen = true;
        this.createTimeline();

        Scroll.scrollTo({
            el: this.view,
            duration: window.matchMedia('(orientation: landscape)').matches ? 0.75 : 0,
            ease: 'sine.out',
            offsetY: window.matchMedia('(orientation: landscape)').matches ? this.view.parentElement.clientHeight : -1,
        });
    };
}
