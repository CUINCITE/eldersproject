import { gsap } from 'gsap/dist/gsap';

export const sticky = (el: HTMLElement) => {
    const endTrigger = document.querySelector('#interviews');

    gsap.to(el, {
        scrollTrigger: {
            start: 'top 25px',
            end: 'top 75%',
            pin: el,
            endTrigger,
            onLeave: () => {
                gsap.to(el, { opacity: 0, duration: 0.3 });
            },
            onEnterBack: () => {
                gsap.to(el, { opacity: 1, duration: 0.3 });
            },
        },
    });
};
