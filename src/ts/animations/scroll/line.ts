import { gsap } from 'gsap/dist/gsap';

export const line = (el: HTMLElement) => {
    gsap.set(el, { transformOrigin: 'bottom center' });
    gsap.fromTo(el, { scaleY: 0 }, {
        scaleY: 1,
        duration: 0.8,
        ease: 'power2.out',
        clearProps: 'all',
        scrollTrigger: {
            trigger: el,
            pinSpacing: false,
            start: 'top bottom',
            invalidateOnRefresh: true,
        },
    });
};
