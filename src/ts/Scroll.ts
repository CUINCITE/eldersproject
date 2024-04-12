/* eslint-disable @typescript-eslint/member-ordering */
import { gsap } from 'gsap/dist/gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/dist/ScrollToPlugin';
import { Component } from './components/Component';
import { getAnimation } from './Animate';
import { animations, scrolls } from './animations/all';


export type ScrollToProps = {
    el?: HTMLElement;
    isSmooth?: boolean;
    offsetY?: number;
    duration?: number;
    ease?: string;
    y?: number;
    onComplete?: ()=> void;
}

interface IScrollData {
    el: HTMLElement;
    type: string;
    delay?: number;
    action?: string;
    component?: Component;
    quick?: boolean;
}

interface IParallaxData {
    el: HTMLElement;
    parallax: number,
    delay?: number;
    component?: Component;
}

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);



export default class Scroll {

    public static matchMedia: any = null;

    private static enabled: boolean = true;
    private static scrollCache: { [key: string]: number } = {};
    private firstLoad: boolean = true;


    public static resize(): void {
        ScrollTrigger.refresh();
    }


    public static enable(): void {
        Scroll.enabled = true;
    }


    public static disable(): void {
        Scroll.enabled = false;
    }


    public static start(): void {
        window.addEventListener('scroll', Scroll.onScroll);
    }


    public static stop(): void {
        window.removeEventListener('scroll', Scroll.onScroll);
    }



    public static resetScrollCache(pathname): void {
        Scroll.scrollCache[pathname] = 0;
    }


    private static onScroll = () => {
        if (!Scroll.enabled) { return; }
        Scroll.scrollCache[window.location.pathname] = window.scrollY;
    };



    public static scrollTo = async({
        el,
        y,
        duration = 1,
        ease = 'none',
        offsetY = 0,
    }: ScrollToProps): Promise<void> => new Promise(resolve => {
        gsap.to(window, {
            scrollTo: {
                y: y ?? el,
                x: 0,
                offsetY,
            },
            duration,
            ease,
            onComplete: () => resolve(),
        });
    });



    public static scrollToTop = async(fast?: boolean): Promise<void> => {
        await Scroll.scrollTo({
            y: 0,
            el: document.querySelector('[data-page]'),
            duration: fast ? 0 : 2,
        });
    };



    public static scrollToCached(): void {
        // const y = Scroll.scrollCache[normalizeUrl(window.location.pathname + window.location.search)] || 0;
        // TEMP - testing
        const y = 0;
        Scroll.scrollTo({ y, duration: 0 });
    }



    public async load(): Promise<void> {
        (ScrollTrigger as any).clearScrollMemory('manual');
        this.bindHashClick();
        this.setup();
        Scroll.resize();
    }



    public setup(): void {

        console.log('scroll setup', gsap.version);

        // if (browser.safari) { return; }

        Scroll.matchMedia = (gsap as any).matchMedia();
        // ScrollTrigger.normalizeScroll({ type: 'touch' });

        // Scroll.matchMedia.add('(min-width: 1024px)', () => {}


        // general animations:
        [...document.querySelectorAll('[data-animation]')]
            .map((el: HTMLElement) => <IScrollData>{
                el,
                type: el.dataset.animation,
                delay: parseInt(el.dataset.delay, 10) || 0,
                action: el.dataset.action || 'reset',
            }).forEach((item: IScrollData) => {
                if (animations[item.type]) {
                    ScrollTrigger.create({
                        trigger: item.el,
                        toggleActions: `play pause resume ${item.action}`,
                        animation: getAnimation(item.type, item.el, item.delay || 0),
                    });
                } else {
                    console.warn(`animation type "${item.type}" does not exist`, item.el);
                }
            });


        // custom animations:
        [...document.querySelectorAll('[data-scroll]')]
            .map((el: HTMLElement) => <IScrollData>{
                el,
                type: el.dataset.scroll,
                delay: parseInt(el.dataset.delay, 10) || 0,
                quick: this.firstLoad ? false : el.getBoundingClientRect().top < window.innerHeight,
            }).forEach((item: IScrollData) => {
                if (scrolls[item.type]) {
                    scrolls[item.type](item.el, item.delay, item.quick);
                } else {
                    console.warn(`scroll type "${item.type}" does not exist`, item.el);
                }
            });


        // parallaxes:
        [...document.querySelectorAll('[data-parallax]')]
            .map((el: HTMLElement) => <IParallaxData> {
                el,
                parallax: parseInt(el.dataset.parallax, 10),
                delay: el.dataset.delay || 0,
            }).forEach((item: IParallaxData) => {
                gsap.set(item.el, { clearProps: 'all' });
                gsap.fromTo(item.el, { y: -item.parallax * (window.innerWidth / 1280) }, {
                    y: () => item.parallax * (window.innerWidth / 1280),
                    ease: 'none',
                    scrollTrigger: {
                        trigger: item.el,
                        scrub: true,
                    },
                });
            });

        // intersection observer + css animations
        const observer = new IntersectionObserver(
            entries => entries.forEach(
                entry => {
                    console.log(entry, entry.boundingClientRect.top, entry.isIntersecting);
                    entry.target.classList.remove('is-in-view', 'is-below', 'is-above');

                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-in-view');
                    } else if (entry.boundingClientRect.top > 0) {
                        entry.target.classList.add('is-below');
                    } else {
                        entry.target.classList.add('is-above');
                    }
                },
                { root: null, threshold: 0 },
            ),
        );
        [...document.querySelectorAll('[data-observe]')]
            .forEach((el: HTMLElement) => {
                observer.observe(el);
            });


        this.firstLoad = false;
    }



    public revertAnimations(): void {
        Scroll.matchMedia?.revert();
    }



    private bindHashClick(): void {
        document.querySelectorAll('a[href^="#"]:not(a[href="#"])').forEach((el: HTMLAnchorElement) => {
            el.addEventListener('click', this.onHashClickHandler);
        });
    }



    private onHashClickHandler = e => {
        e.preventDefault();
        e.stopPropagation();

        const { hash } = (e.currentTarget as HTMLAnchorElement);
        const target = document.querySelector(hash) as HTMLElement;

        target
            ? Scroll.scrollTo({ el: target, duration: 0 })
            : console.warn('There is no %s element', hash);
    };
}
