import { gsap } from 'gsap/dist/gsap';

export const sticky = (el: HTMLElement) => {
    const endTrigger = document.querySelector('#interviews');

    gsap.to(el, {
        scrollTrigger: {
            start: 'top 25px',
            end: `top ${el.clientHeight + 50}px`,
            pin: el,
            endTrigger,
            markers: true,
        },
    });
};
