/* eslint-disable max-classes-per-file */

import { Handler } from '../Handler';
import * as Utils from '../Utils';


export interface ISwipeCoordinates {
    x?: number;
    y?: number;
    startX?: number;
    startY?: number;
    deltaX?: number;
    deltaY?: number;
    direction?: string;
}

export interface ISwipeOptions {
    vertical?: boolean;
    horizontal?: boolean;
    minimum?: number;
    disableMouse?: boolean;
    disableTouch?: boolean;
    handler?: HTMLElement;
}

export class SwipeEvents {
    public static START: string = 'start';
    public static UPDATE: string = 'update';
    public static END: string = 'end';
}

export class SwipeAxes {
    public static HORIZONTAL: string = 'h';
    public static VERTICAL: string = 'v';
}

export class SwipeDirections {
    public static LEFT: string = 'left';
    public static RIGHT: string = 'right';
    public static UP: string = 'up';
    public static DOWN: string = 'down';
    public static NONE: string = 'none';
    public static CLICK: string = 'click';
}


export class Swipe extends Handler {
    public swiping: boolean = false;

    // delta of current movement:
    public deltaX: number = 0;
    public deltaY: number = 0;

    // current position:
    public x: number = 0;
    public y: number = 0;

    private elHandler: HTMLElement;
    private startX: number = 0;
    private startY: number = 0;
    private uid: string;
    private mouse: ISwipeCoordinates = { x: 0, y: 0 };
    private dragged: boolean = false;
    private axe: SwipeAxes = null;

    private offsetX: number = 0;
    private offsetY: number = 0;

    private disabled: boolean = false;

    private settings: ISwipeOptions;


    constructor(protected view: HTMLElement, protected options?: ISwipeOptions) {
        super();

        this.settings = {
            horizontal: true,
            vertical: false,
            minimum: 80,
            disableMouse: false,
            disableTouch: false,
            handler: null,
            ...options,
        };

        this.elHandler = (this.settings.handler ? this.settings.handler : this.view);

        this.updateCursor();
        this.uid = Utils.generateUID();
        this.bind();
    }


    public destroy(): void {
        super.destroy();
        this.unbind();
    }


    public toggle(enable: boolean): void {
        this.disabled = !enable;
        this.updateCursor();
    }


    public end(): void {
        if (this.swiping) {
            this.endSwipe();
            this.axe = null;
        }
    }


    public resize(): void {
        const sT = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        this.offsetX = this.view.getBoundingClientRect().left;
        this.offsetY = this.view.getBoundingClientRect().top - sT;
    }


    private updateCursor(): void {
        const isMouseDisabled = !Modernizr.touchevents && !!this.settings.disableMouse;
        this.elHandler.classList.toggle('is-grabbable', !this.disabled && !isMouseDisabled);
    }


    private bind(): void {
        if (!this.settings.disableMouse) {
            this.elHandler.addEventListener('mousedown', this.onMouseDown);

            this.view.addEventListener('mousemove', this.onMouseMove);
            this.view.addEventListener('mouseup', this.onMouseUp);
            this.view.addEventListener('mouseleave', this.onMouseUp);
        }

        if (!this.settings.disableTouch) {
            this.elHandler.addEventListener('touchstart', this.onTouchStart);

            this.view.addEventListener('touchmove', this.onTouchMove);

            document.addEventListener('touchend', this.onTouchEnd);
        }
    }


    private unbind(): void {
        if (!this.settings.disableMouse) {
            this.elHandler.removeEventListener('mousedown', this.onMouseDown);

            this.view.removeEventListener('mousemove', this.onMouseMove);
            this.view.removeEventListener('mouseup', this.onMouseUp);
            this.view.removeEventListener('mouseleave', this.onMouseUp);
        }

        if (!this.settings.disableTouch) {
            this.elHandler.removeEventListener('touchstart', this.onTouchStart);

            this.view.removeEventListener('touchmove', this.onTouchMove);

            document.removeEventListener('touchend', this.onTouchEnd);
        }
    }


    private onMouseDown = (e): void => {
        if ((e.which && e.which === 3) || (e.button && e.button === 2)) { return; } // right click

        e.preventDefault();
        this.mouse.startX = (e.clientX || e.pageX) - this.offsetX;
        this.mouse.startY = (e.clientY || e.pageY) - this.offsetY;
        this.startSwipe();
    };


    private onMouseMove = (e): void => {
        e.preventDefault();
        if (this.swiping) {
            this.mouse.x = (e.clientX || e.pageX) - this.offsetX;
            this.mouse.y = (e.clientY || e.pageY) - this.offsetY;
            const diffX = Math.abs(this.mouse.x - this.mouse.startX);
            const diffY = Math.abs(this.mouse.y - this.mouse.startY);

            if (!this.axe && (diffX > 12 || diffY > 12)) {
                this.axe = diffX > diffY ? SwipeAxes.HORIZONTAL : SwipeAxes.VERTICAL;
            }

            if (diffX > 12 || diffY > 12) {
                this.dragged = true;
            }

            if ((this.axe === SwipeAxes.HORIZONTAL && !!this.settings.horizontal) || (this.axe === SwipeAxes.VERTICAL && !!this.settings.vertical)) {
                e.preventDefault();
                this.updateSwipe();
            }

            this.view.querySelectorAll('a').forEach(el => { el.style.pointerEvents = 'none'; });
        }
    };


    private onMouseUp = (e): boolean => {
        if (this.swiping) {
            e.preventDefault();
            e.stopPropagation();
            this.endSwipe();
            return false;
        }

        this.view.querySelectorAll('a').forEach(el => { el.style.pointerEvents = ''; });

        this.axe = null;
        return true;
    };


    private onTouchStart = (e: TouchEvent): void => {
        this.mouse.startX = e.touches[0].pageX;
        this.mouse.startY = e.touches[0].pageY;

        this.startSwipe();
    };


    private onTouchMove = (e: TouchEvent): void => {
        if (this.swiping) {

            this.mouse.x = e.touches[0].pageX;
            this.mouse.y = e.touches[0].pageY;

            const diffX = Math.abs(this.mouse.x - this.mouse.startX);
            const diffY = Math.abs(this.mouse.y - this.mouse.startY);

            if (!this.axe && (diffX > 12 || diffY > 12)) {
                this.axe = diffX > diffY ? SwipeAxes.HORIZONTAL : SwipeAxes.VERTICAL;
            }

            if (diffX > 12 || diffY > 12) {
                this.dragged = true;
            }

            if ((this.axe === SwipeAxes.HORIZONTAL && !!this.settings.horizontal) || (this.axe === SwipeAxes.VERTICAL && !!this.settings.vertical)) {
                e.preventDefault();
                this.updateSwipe();
            } else if (this.axe) {
                this.swiping = false;
            }
        }
    };


    private onTouchEnd = (e: TouchEvent): void => {
        if (this.swiping) {
            // e.preventDefault();
            this.endSwipe();
        }
        this.axe = null;
    };


    private startSwipe(): void {
        if (!this.disabled) {
            this.swiping = true;
            this.dragged = false;
            this.startX = 0;
            this.startY = 0;
            this.axe = null;

            this.trigger(SwipeEvents.START, {
                target: this.view,
                x: this.mouse.startX - this.view.getBoundingClientRect().left,
                y: this.mouse.startY - this.view.getBoundingClientRect().top,
                instance: this,
            });

            this.elHandler.classList.add('is-grabbed');
        }
    }


    private updateSwipe(): void {
        const x = this.startX + this.mouse.x - this.mouse.startX;
        const y = this.startY + this.mouse.y - this.mouse.startY;

        this.x = x;
        this.y = y;

        this.trigger(SwipeEvents.UPDATE, {
            target: this.view,
            deltaX: this.settings.horizontal ? x : 0,
            deltaY: this.settings.vertical ? y : 0,
            x: this.mouse.x,
            y: this.mouse.y,
            instance: this,
        });

        this.elHandler.classList.add('is-dragged');
    }


    private endSwipe(): void {
        this.swiping = false;
        // eslint-disable-next-line no-nested-ternary
        let direction;
        if (this.axe === SwipeAxes.HORIZONTAL) {
            if (Math.abs(this.mouse.x - this.mouse.startX) < this.settings.minimum) {
                direction = SwipeDirections.NONE;
            } else {
                direction = this.x < this.startX ? SwipeDirections.LEFT : SwipeDirections.RIGHT;
            }
        } else if (this.axe === SwipeAxes.VERTICAL) {
            if (Math.abs(this.mouse.y - this.mouse.startY) < this.settings.minimum) {
                direction = SwipeDirections.NONE;
            } else {
                direction = this.y < this.startY ? SwipeDirections.UP : SwipeDirections.DOWN;
            }
        } else if (this.axe === null) {
            direction = !this.dragged ? SwipeDirections.CLICK : SwipeDirections.NONE;
        }

        this.trigger(SwipeEvents.END, {
            target: this.view,
            direction,
            instance: this,
        });

        this.elHandler.classList.remove('is-grabbed', 'is-dragged');
    }
}
