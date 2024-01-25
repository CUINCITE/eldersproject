import { gsap } from 'gsap/dist/gsap';

export const sticker = el => {

    gsap.fromTo(el.querySelector('.sticker__text'), { opacity: 0 }, {
        opacity: 1,
        duration: 0.1,
        delay: 0.5,
        scrollTrigger: {
            trigger: el,
            pinSpacing: false,
            start: 'top bottom',
            invalidateOnRefresh: true,
        },
        onComplete: () => {
            el.classList.add('is-visible');
        },
    });
};
