import { gsap } from 'gsap/dist/gsap';
import { Handler } from '../../Handler';
import { easing } from '../../Site';
import { PopupData } from './Video.types';

export class PlayerPopups extends Handler {

    private static DURATION: number = 3;

    private related: Array<PopupData>;
    private popups: Array<HTMLElement>;



    constructor(private view: HTMLElement) {
        super();

        this.view = view;
        this.popups = view ? [...this.view.children] as HTMLElement[] : null;
    }



    public loadData({ related }): void {
        this.related = related;
    }



    public check(current?: number): void {

        if (!current) { return; }

        this.related?.forEach((element, key) => {

            if (!element.timeStart) {
                return;
            }

            if (current < element.timeStart || current > element.timeStart + PlayerPopups.DURATION) {
                if (element.shown) {
                    element.shown = false;
                    this.hidePopup(this.popups[key]);
                }
                return;
            }

            if (element.shown) { return; }

            this.popups[key].style.display = 'block';
            element.shown = true;

            this.showPopup(this.popups[key]);
        });
    }



    private showPopup(popupEl: HTMLElement): void {
        gsap.fromTo(popupEl, {
            y: -20,
            opacity: 0,
            scale: 0.9,
            transformOrigin: 'bottom',
        }, {
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 0.7,
            delay: 0.15,
            pointerEvents: 'all',
            ease: easing,
        });
    }



    private hidePopup(popupEl: HTMLElement): void {
        gsap.to(popupEl, {
            y: 20,
            opacity: 0,
            height: 0,
            duration: 0.7,
            scale: 0.9,
            pointerEvents: 'none',
            ease: easing,
            clearProps: 'height,scale',
            onComplete: () => {
                popupEl.style.display = 'none';
            },
        });
    }
}
