import { gsap } from 'gsap/dist/gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const collectionsSimple = (el: HTMLElement) => {
    const cardsWrap: HTMLElement = el.querySelector('.js-scroll-cards');
    const namesWrap: HTMLElement = el.querySelector('.js-scroll-names');
    const offset = (window.innerHeight - cardsWrap.clientHeight) / 2;
    const items = el.querySelectorAll('.js-accordeon-item');



    ScrollTrigger.create({
        trigger: el,
        start: `top ${offset}px`,
        end: 'bottom 92%',
        pin: cardsWrap,
        endTrigger: namesWrap,
        markers: true,
    });

    ScrollTrigger.batch(items, {
        start: 'top 55%',
        end: 'bottom top',
    });
};
