import { gsap } from 'gsap/dist/gsap';
import { easing } from '../../Site';

export const illustration = (el: HTMLElement) => {

    gsap.set(el, {
        transformOrigin: '50% 50%',
        yPercent: 50,
        rotate: -15,
    });


    gsap.fromTo(el, {
        yPercent: 50,
        rotate: -15,
    }, {
        yPercent: 0,
        rotate: 0,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: el,
            pinSpacing: false,
            start: 'top bottom',
            invalidateOnRefresh: true,
        },
    });
};