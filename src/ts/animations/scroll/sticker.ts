import { gsap } from 'gsap/dist/gsap';

export const sticker = el => {

    gsap.fromTo(el.querySelector('.sticker__text'), { opacity: 0 }, {
        opacity: 1,
        duration: 0.3,
        scrollTrigger: {
            trigger: el,
            pinSpacing: false,
            start: 'top center',
            invalidateOnRefresh: true,
        },
        onStart: () => {
            el.classList.add('is-visible');
        },
    });
};
