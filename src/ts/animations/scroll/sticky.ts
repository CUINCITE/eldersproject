import { gsap } from 'gsap/dist/gsap';

export const sticky = el => {
    const endTrigger = document.querySelector('#interviews');

    gsap.to(el, {
        scrollTrigger: {
            start: 'top 10%',
            end: 'top 100%',
            onLeave: () => el.classList.add('is-hidden'),
            onEnterBack: () => el.classList.remove('is-hidden'),
            pin: el,
            endTrigger,
        },
    });
};
