import { breakpoint } from '../Site';
import { Component } from './Component';
import { ISwipeCoordinates, Swipe, SwipeDirections, SwipeEvents } from './Swipe';


export class Collections extends Component {
    private allItems: NodeListOf<HTMLElement>;
    private cards: NodeListOf<HTMLElement>;
    private dots: NodeListOf<HTMLElement>;
    private captions: NodeListOf<HTMLElement>;
    private swipeComp: Swipe;
    private x: number;
    private startX: number;
    private activeIndex: number = 0;
    private currentBreakpoint: string;

    constructor(protected view: HTMLElement) {
        super(view);

        this.allItems = this.view.querySelectorAll('.js-accordeon-item');
        this.cards = this.view.querySelectorAll('.js-card');
        this.dots = this.view.querySelectorAll('.js-dot');
        this.captions = this.view.querySelectorAll('.js-caption');
        this.currentBreakpoint = breakpoint.value;

        this.bind();
    }


    public resize = (wdt: number, hgt: number): void => {
        const newBreakpoint = breakpoint.value;
        if (newBreakpoint === this.currentBreakpoint) return;

        if (!breakpoint.desktop) {
            this.runSwipe();
        } else this.destroySwipe();

        this.currentBreakpoint = newBreakpoint;
    };



    private runSwipe(): void {
        this.swipeComp = new Swipe(this.view.querySelector('.js-scroll-cards'), { horizontal: true, vertical: false });

        this.swipeComp.on(SwipeEvents.START, e => {
            this.startX = this.x;
        });

        this.swipeComp.on(SwipeEvents.UPDATE, e => {
            this.x = this.startX + e.deltaX;
            this.update();
        });

        this.swipeComp.on(SwipeEvents.END, (e: ISwipeCoordinates) => {
            const x = 0;
            if (e.direction === SwipeDirections.LEFT) this.updateCards(1);
            if (e.direction === SwipeDirections.RIGHT) this.updateCards(-1);
        });
    }



    private destroySwipe(): void {
        this.swipeComp?.destroy();
    }



    private bind(): void {
        this.allItems.forEach((item: HTMLElement) => {
            item.addEventListener('mouseenter', this.onItemEnter);
        });

        !breakpoint.desktop && this.runSwipe();
    }



    private update(): void {
        // (this.view.querySelector('.js-scroll-cards') as HTMLElement).style.transform = `translateX(${this.x}px)`;
    }



    private updateCards(direction: number): void {
        this.activeIndex += direction;

        if (this.activeIndex < 0) {
            this.activeIndex = 0;
            return;
        }
        if (this.activeIndex > this.cards.length - 1) {
            this.activeIndex = this.cards.length - 1;
            return;
        }

        this.cards.forEach((card: HTMLElement) => card.classList.remove('is-current', 'is-next', 'is-previous', 'is-after-next'));

        // CSS animations later
        this.cards[this.activeIndex - 1]?.classList.add('is-previous');
        this.cards[this.activeIndex]?.classList.add('is-current');
        this.cards[this.activeIndex + 1]?.classList.add('is-next');
        this.cards[this.activeIndex + 2]?.classList.add('is-after-next');


        this.dots.forEach((dot: HTMLElement) => dot.classList.remove('is-current'));
        this.dots[this.activeIndex].classList.add('is-current');

        this.captions.forEach((caption: HTMLElement) => caption.classList.remove('is-current'));
        this.captions[this.activeIndex].classList.add('is-current');
    }



    private onItemEnter = (event: Event): void => {
        const target = event.target as HTMLElement;

        [...this.allItems].filter((item: HTMLElement) => item !== target).forEach(item => item.classList.remove('is-active'));
        target.classList.add('is-active');
    };
}
