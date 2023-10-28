import { gsap } from 'gsap/dist/gsap';
import { AnimationType } from '../Animate';
import { easing } from '../Site';

export const fadeUp: AnimationType = (el, delay = 0) => {
    gsap.killTweensOf(el, { opacity: true, y: true });
    return gsap.fromTo(el, { opacity: 0, y: 60 }, {
        duration: 1.4, opacity: 1, y: 0, ease: easing, delay
    });
};
