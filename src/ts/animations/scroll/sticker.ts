import { gsap } from 'gsap/dist/gsap';

export const sticker = (el: HTMLElement, delay?: number, quick?: number) => {
    if (quick) {
        gsap.set(el, { opacity: 1 });
        el.classList.add('is-visible');
        return;
    }

    // default delay is .5s
    const stickerDelay: number = parseFloat(el.getAttribute('data-delay')) || 0.5;

    gsap.timeline({
        delay: stickerDelay,
        scrollTrigger: {
            trigger: el,
            pinSpacing: false,
            start: 'top bottom',
            invalidateOnRefresh: true,
        },

    })
        .addLabel('start')
        .fromTo(el, { opacity: 0 }, {
            opacity: 1,
            duration: 0.2,
        }, 'start')
        .fromTo(el, { scale: 0.8 }, {
            duration: 0.5,
            scale: 1,
            onStart: () => {
                el.classList.add('is-visible');
                setTimeout(() => {
                    // fold sticker
                }, 50);
            },
        }, 'start');


};
