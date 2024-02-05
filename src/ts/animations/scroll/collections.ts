import { gsap } from 'gsap/dist/gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const collections = (el: HTMLElement) => {
    const cardsWrap: HTMLElement = el.querySelector('.js-scroll-cards');
    const namesWrap: HTMLElement = el.querySelector('.js-scroll-names');
    const offset = (window.innerHeight - cardsWrap.clientHeight) / 2;


    ScrollTrigger.create({
        trigger: el,
        start: `top ${offset}px`,
        end: 'bottom bottom',
        pin: cardsWrap,
        endTrigger: namesWrap,
    });
};
