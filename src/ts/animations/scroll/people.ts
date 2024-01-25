import { gsap } from 'gsap/dist/gsap';

export const people = (el: HTMLElement) => {
    const items: NodeListOf<HTMLElement> = el.querySelectorAll('.js-person');


    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: el,
            pinSpacing: false,
            start: 'top bottom',
            invalidateOnRefresh: true,
        },
    });
    tl.addLabel('start');


    [...items].forEach((item, i) => {
        gsap.set(items, {
            transformOrigin: '50% 50%',
            yPercent: 50,
            rotate: i % 2 === 0 ? 10 : -10,
        });
        tl.fromTo(item, {
            yPercent: 50,
            rotate: i % 2 === 0 ? 10 : -10,
        }, {
            yPercent: 0,
            rotate: 0,
            duration: 0.45,
            delay: 0.1 * i,
            ease: 'power2.out',
            clearProps: 'all',
        }, 'start');
    });
};
