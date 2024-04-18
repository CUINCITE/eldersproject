/* eslint-disable consistent-return */
/* eslint-disable array-callback-return */
/* eslint-disable max-classes-per-file */
import { gsap } from 'gsap/dist/gsap';
import { easing } from '../Site';
import { Handler } from '../Handler';
import { IBreakpoint } from '../Breakpoint';
import { Component } from '../components/Component';
import { components } from '../Classes';
import { Images } from '../widgets/Images';
import * as Utils from '../Utils';


export class PageEvents {
    public static readonly PROGRESS: string = 'progress';
    public static readonly COMPLETE: string = 'complete';
    public static readonly CHANGE: string = 'append';
}



export class Page extends Handler {

    public components: Array<Component>;



    // eslint-disable-next-line no-unused-vars
    constructor(protected view: HTMLElement, options?) {
        super();
        this.view.style.opacity = '0';

        this.components = [];
        this.buildComponents(this.view.parentNode.querySelectorAll('[data-component]'));
    }



    /**
     * preload necessary assets:
     * @return {Promise<boolean>} loading images promise
     */
    public preload(): Promise<void> {
        return Images.preload(this.view.querySelectorAll('img.preload'))
            .then(() => {
                this.trigger(PageEvents.COMPLETE);
            });
    }



    /**
     * check if any Component can be changed after onState
     * @return {boolean} returns true when one of the components
     * takes action in onState function call
     */
    public onState(): boolean {
        let changed: boolean = !!false;

        for (let i = 0; i < this.components.length; i += 1) {
            const component = this.components[i];
            const componentChanged: boolean = component.onState();
            if (!changed && !!componentChanged) {
                changed = true;
            }
        }

        return changed;
    }



    /**
     * page entering animation
     * @param {number} delay animation delay
     */
    public animateIn(first?: boolean, boxes?: boolean, delay?: number): Promise<void> {
        return new Promise(resolve => {
            for (let i = 0; i < this.components.length; i += 1) {
                this.components[i].animateIn(i, delay);
            }

            if (boxes && window.location.search.indexOf('boxes') > -1) {
                const boxesToShow = Utils.findVisibleBoxes(document.querySelectorAll('[data-scroll="box"], .box'));
                const pseudoVariable = { value: 0 };

                // used to run scroll animation a bit before boxes' animation (better feeling)
                gsap.fromTo(pseudoVariable, { value: 0 }, {
                    value: 1,
                    duration: 0.5,
                    ease: 'power2.out',
                    onComplete: () => resolve(),
                });

                gsap.fromTo(boxesToShow, { y: window.innerHeight }, {
                    y: 0,
                    duration: 0.75,
                    stagger: 0.1,
                    ease: 'power2.out',
                    clearProps: 'all',
                    onStart: () => {
                        gsap.set(this.view, { opacity: 1 });
                        // prevent double animation
                        boxesToShow.forEach(box => box.classList.add('is-animated'));
                    },
                    onComplete: () => {
                        document.documentElement.classList.remove('is-transition');
                        document.body.classList.remove('is-transition');
                        // resolve();
                    },
                });
            } else {
                gsap.to(this.view, {
                    duration: first ? 0.5 : 0.01,
                    opacity: 1,
                    delay: delay || 0,
                    onComplete: () => {
                        document.documentElement.classList.remove('is-transition');
                        document.body.classList.remove('is-transition');
                        resolve();
                    },
                });
            }
        });
    }



    /**
     * page exit animation
     * (called after new content is loaded and before is rendered)
     * @return {Promise<boolean>} animation promise
     */
    public animateOut(): Promise<void> {

        // animation of the page:
        const pageAnimationPromise = new Promise<void>(resolve => {

            const isMenuOpen = document.body.classList.contains('has-menu-open');
            const illustrations = document.querySelectorAll('.js-illustration');
            const filteredBoxes = [...document.querySelectorAll('[data-scroll="box"], .box')].filter(element => {
                let parent = element.parentElement;
                while (parent) {
                    if (parent.matches('[data-scroll="box"], .box')) return false;
                    parent = parent.parentElement;
                }
                return true;
            });
            const boxes: Utils.IBox[] = Utils.getVisibleItems(filteredBoxes);
            const children = [...boxes].map(box => [...box.element.children]);
            const elementsToFade = [...illustrations, ...children];

            console.log(...children);


            children.length && gsap.fromTo(elementsToFade, { opacity: 1 }, {
                opacity: 0,
                duration: isMenuOpen ? 0.001 : 0.3,
                ease: 'power2.out',
                onStart: () => {
                    document.body.classList.add('is-transition');
                    document.documentElement.classList.add('is-transition');
                },
            });

            children.length && gsap.fromTo(elementsToFade, { opacity: 0 }, {
                opacity: 1,
                duration: isMenuOpen ? 0.001 : 0.3,
                delay: 5,
                ease: 'power2.out',
            });

            if (isMenuOpen) {
                resolve();
                return;
            }


            const placeholders = Utils.createPlaceholders(boxes);

            [...placeholders].reverse().forEach((item, index) => {
                gsap.to(item, {
                    y: window.innerHeight * 1.3,
                    rotate: index % 2 === 0 ? 10 : -10,
                    duration: 1,
                    delay: index * 0.02,
                    ease: easing,
                    onComplete: () => {
                        item.remove();
                        // after all tweens
                        if (index === placeholders.length - 1) {
                            document.body.scrollTop = 0;
                            // document.body.classList.remove('is-transition');
                            resolve();
                        }
                    },
                });
            });
        });

        // animations of all components:
        const componentAnimations: Promise<void>[] = this.components.map(obj => obj.animateOut());

        // return one promise waiting for all animations:
        return new Promise<void>(resolve => {
            const allPromises: Promise<void>[] = componentAnimations.concat(pageAnimationPromise);

            Promise.all<void>(allPromises).then(() => {
                resolve();
            });
        });
    }



    /**
     * resize handler
     * @param {[type]} wdt        window width
     * @param {[type]} hgt        window height
     * @param {[type]} breakpoint IBreakpoint object
     */
    // eslint-disable-next-line no-unused-vars
    public resize(wdt: number, hgt: number, breakpoint: IBreakpoint, bpChanged?: boolean): void {
        this.components.forEach(item => {
            item.resize(wdt, hgt);
        });
    }



    /**
     * cleanup when closing Page
     */
    public destroy(): void {
        this.components.forEach(item => item.destroy());
        this.components = [];
        this.view = null;
        super.destroy();
    }



    protected buildComponents(componentsList: NodeList): void {
        this.components = [];

        this.components = [...componentsList].map(el => {
            const element = <HTMLElement>el;
            const name = element.dataset.component;
            if (name !== undefined && components[name]) {
                let options: Object;
                if (element.dataset.options) {
                    options = JSON.parse(element.dataset.options);
                }
                const component = new components[name](element, options);
                return component;
            }
            window.console.warn('There is no `%s` component!', name);
        }).filter(Boolean);
    }



    private onComponentChange = (el): void => {
        this.buildComponents(el.querySelectorAll('[data-component]'));
        this.trigger(PageEvents.CHANGE, el);
    };



    // short call
    // eslint-disable-next-line no-unused-vars
    private callAll(fn: string, ...args): void {
        for (let i = 0; i < this.components.length; i += 1) {
            const component = this.components[i];
            if (typeof component[fn] === 'function') {
                component[fn](...args);
            }
        }
    }
}
