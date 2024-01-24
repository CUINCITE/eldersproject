import { gsap } from 'gsap/dist/gsap';
import { easing } from '../../Site';

export const box = el => {

    gsap.fromTo(el, { y: window.innerHeight / 2 }, {
        y: 0,
        duration: 1.2,
        ease: easing,
        scrollTrigger: {
            trigger: el,
            pinSpacing: false,
            start: 'top bottom',
            invalidateOnRefresh: true,
        },
    });
};
