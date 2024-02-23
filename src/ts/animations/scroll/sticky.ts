import { gsap } from 'gsap/dist/gsap';

export const sticky = el => {
    const endTrigger = document.querySelector('#interviews');

    gsap.to(el, {
        scrollTrigger: {
            start: 'top 10%',
            end: 'top 10%',
            onUpdate: self => el.classList.toggle('is-hidden', self.progress > 0.90),
            pin: el,
            endTrigger,
            markers: true,
        },
    });
};
