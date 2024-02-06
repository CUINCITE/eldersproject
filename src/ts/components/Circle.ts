import { gsap } from 'gsap/dist/gsap';
import { Component } from './Component';

export class Circle extends Component {

    private circles: NodeListOf<HTMLElement>;
    private images: NodeListOf<HTMLElement>;
    private circlesTimeline: any;

    constructor(protected view: HTMLElement) {
        super(view);

        this.circles = this.view.querySelectorAll('.js-circle');
        this.images = this.view.querySelectorAll('.js-illu');

        this.loop();
    }



    public updatePosition = (value: number, fast?: boolean): void => {
        gsap.to(this.view, {
            x: value,
            duration: fast ? 0 : 0.3,
            opacity: fast && 1,
            ease: 'sine',
        });
    };



    private loop = (): void => {
        this.circlesTimeline = gsap.timeline({ repeat: -1 });

        this.circlesTimeline.set([this.circles], { opacity: 0 });

        [...this.circles].forEach((circle, index) => {
            this.circlesTimeline.fromTo(circle, { scale: 0.6 }, {
                scale: 1,
                duration: 0.3,
                ease: 'sine',
                onStart: () => {
                    circle.style.opacity = '1';
                    gsap.fromTo(this.images[index], { opacity: 0 }, {
                        opacity: 1,
                        duration: 0.25,
                        ease: 'sine',
                    });
                    gsap.set([...this.images].filter(img => img !== this.images[index]), { opacity: 0 });
                },
            }, '+=1.7');
        });
    };
}
