import { gsap } from 'gsap/dist/gsap';
import { easing } from '../Site';
import { Component } from './Component';

export class SmoothScroll extends Component {

    private target: string;

    constructor(protected view: HTMLElement) {
        super(view);
        this.bind();
    }

    private bind(): void {
        this.view.addEventListener('click', this.onClick);
        this.target = this.view.dataset.target;
    }

    private onClick = e => {
        e.preventDefault();
        e.stopPropagation();

        gsap.to(window, { duration: 2, scrollTo: this.target, ease: easing });
    };
}
