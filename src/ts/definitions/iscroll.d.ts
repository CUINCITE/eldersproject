// Type definitions for iScroll 5
// Project: http://cubiq.org/iscroll-5-ready-for-beta-test
// Definitions by: Christiaan Rakowski <https://github.com/csrakowski/>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

interface IScrollOptions {
    x?: number;
    y?: number;
    bounce?: boolean;
    bounceLock?: boolean;
    momentum?: boolean;
    lockDirection?: boolean;
    useTransform?: boolean;
    useTransition?: boolean;
    topOffset?: number;
    checkDOMChanges?: boolean;
    handleClick?: boolean;

    // Scrollbar
    scrollbars?: boolean | string;
    shrinkScrollbars?: string;
    interactiveScrollbars?: boolean;
    fadeScrollbars?: boolean;

    // Zoom
    zoom?: boolean;
    zoomMin?: number;
    zoomMax?: number;
    doubleTapZoom?: number;
    mouseWheel?: boolean;
    wheelAction?: string;
    snap?: string | boolean;
    snapThreshold?: number;

    // New in IScroll 5?
    resizeIndicator?: boolean;
    mouseWheelSpeed?: number;
    startX?: number;
    startY?: number;
    scrollX?: boolean;
    scrollY?: boolean;
    releaseScroll?: boolean;
    directionLockThreshold?: number;
    bounceTime?: number;
    deceleration?: number;
    snapSpeed?: number;
    // String or function
    bounceEasing?: any;

    preventDefault?: boolean;
    preventDefaultException?: boolean;

    HWCompositing?: boolean;

    freeScroll?: boolean;

    resizePolling?: number;
    tap?: boolean;
    click?: boolean;
    invertWheelDirection?: boolean;
    eventPassthrough?: string | boolean;

    disableTouch?: boolean;
    disableMouse?: boolean;
    disablePointer?: boolean;

    probeType?: number;
}

declare class IScroll {
    constructor (element: string, options?: IScrollOptions);
    constructor (element: HTMLElement, options?: IScrollOptions);

    x: number;
    y: number;
    scrollerWidth: number;
    scrollerHeight: number;
    wrapWidth: number;
    wrapHeight: number;
    options: IScrollOptions;
    maxScrollX: number;
    maxScrollY: number;

    public static utils: any;

    destroy(): void;
    refresh(): void;
    scrollTo(x: number, y: number, time?: number, relative?: boolean): void;
    scrollToElement(element: string, time?: number): void;
    scrollToElement(element: HTMLElement, time?: number): void;
    scrollToElement(element: HTMLElement, time?: number, offsetX?: number | boolean, offsetY?: number | boolean, easing?: Function): void;
    scrollBy(x: number, y: number, time?: number, easing?: Function): void;
    goToPage(pageX: number, pageY: number, time?: number): void;
    disable(): void;
    enable(): void;
    stop(): void;
    zoom(x: number, y: number, scale: number, time?: number): void;
    isReady(): boolean;

    // Events
    on(type: string, fn: (evt?: any) => void): void;
    off(type: string, fn?: (evt?: any) => void): void;
}
