import { gsap } from 'gsap/dist/gsap';
import { easing } from '../../Site';
import { Component } from '../Component';
import { Images } from '../../widgets/Images';
import { CircleData } from './CircleData';


export interface ICircleItems {
    items: [{
        id: number;
        src: string;
        color: string;
    }]
}

export class Circle extends Component {

    private circles: NodeListOf<HTMLElement>;
    private images: NodeListOf<HTMLElement>;
    private circlesTimeline: any;
    private circlesWrapper: HTMLElement;
    private illusWrapper: HTMLElement;
    private mainWrapper: HTMLElement;
    private isLoaded: boolean = false;
    private isShown: boolean = false;


    constructor(protected view: HTMLElement) {
        super(view);

        this.mainWrapper = this.view.querySelector('.js-circle-wrap');
        this.circlesWrapper = this.view.querySelector('.js-circle-circles');
        this.illusWrapper = this.view.querySelector('.js-circle-illus');
    }



    public onState(): boolean {
        this.hide();
        return false;
    }


    public animateIn(): void {
        this.updatePosition(0, true);
        this.init();
    }



    public updatePosition = (value: number, fast?: boolean): void => {
        gsap.to(this.view, {
            x: value,
            duration: fast ? 0 : 0.3,
            opacity: fast && 1,
            ease: 'sine',
        });
    };



    public show = (): void => {
        // load the images only when needed
        if (this.isShown) return;
        if (!this.isLoaded) this.init();

        this.view.style.display = 'block';
        this.view.style.opacity = '0';

        gsap.fromTo(this.view, { scale: 0.6 }, {
            scale: 1,
            duration: 0.3,
            delay: 0.3,
            ease: 'sine',
            onStart: () => {
                this.circlesTimeline?.play();
                this.view.style.opacity = '1';
                this.isShown = true;
            },
        });
    };



    public hide = (): void => {
        gsap.to(this.view, {
            opacity: 0,
            duration: 0.25,
            ease: 'sine',
        });
        this.circlesTimeline?.pause();
        this.isShown = false;
    };



    public init = (): Promise<void> => new Promise(resolve => {
        const itemsArray = CircleData;

        // sort the array randomly
        const shuffledArray = itemsArray.items.sort(() => Math.random() - 0.5);

        // get 6 items to loop. but filter out items with same color
        const seenColors = new Set();
        const uniqueColorItems = shuffledArray.filter(item => {
            if (seenColors.has(item.color)) {
                return false;
            }
            seenColors.add(item.color);
            return true;

        });
        const chosenItems = uniqueColorItems.slice(0, 6);



        this.mainWrapper.style.backgroundColor = `var(--color-${chosenItems[5].color})`;

        const circlesHtml = chosenItems.map(item => `
                    <div class="circle__circle js-circle circle__circle--${item.color}"></div>
                `);
        this.circlesWrapper.innerHTML = circlesHtml.join('');

        const illusHtml = chosenItems.map(item => `
                    <div class="circle__illu js-illu">
                        <img src="${item.src}" alt="Illustration ${item.id}" />
                    </div>
                `);
        this.illusWrapper.innerHTML = illusHtml.join('');

        this.circles = this.view.querySelectorAll('.js-circle');
        this.images = this.view.querySelectorAll('.js-illu');


        Images.preload(this.view.querySelectorAll('img'))
            .then(() => {
                this.loop();
                this.isLoaded = true;
                resolve();
            });
    });



    private async getImages(): Promise<ICircleItems> {
        try {
            const response = await fetch(this.view.dataset.items, { method: 'POST' });
            const data = response.json();
            return data;
        } catch (error) {
            this.view.classList.remove('is-fetching');
            throw new Error(error);
        }
    }



    private loop = (): void => {
        this.circlesTimeline = gsap.timeline({ repeat: -1, repeatDelay: 1.7, onStart: () => this.show() });

        this.circlesTimeline.set([this.circles], { opacity: 0 });

        [...this.circles].forEach((circle, index) => {
            const delay = index === 0 ? '0' : '1.7';
            this.circlesTimeline.fromTo(circle, { scale: 0.6 }, {
                scale: 1,
                duration: 0.4,
                ease: easing,
                onStart: () => {
                    circle.style.opacity = '1';
                    gsap.fromTo(this.images[index], { opacity: 0 }, {
                        opacity: 1,
                        duration: 0.35,
                        ease: easing,
                    });
                    gsap.set([...this.images].filter(img => img !== this.images[index]), { opacity: 0 });
                },
                onComplete: () => {
                    gsap.set([...this.circles].filter(c => c !== this.circles[index]), { opacity: 0 });
                },
            }, `+=${delay}`);
        });
    };
}
