import { gsap } from 'gsap/dist/gsap';
import { AnimationType } from '../Animate';
import { easing } from '../Site';

export const slideUp: AnimationType = (el, delay = 0) => {
    gsap.killTweensOf(el, { y: true });
    return gsap.fromTo(el, { y: 60 }, { duration: 0.8, y: 0, ease: easing, delay });
};
