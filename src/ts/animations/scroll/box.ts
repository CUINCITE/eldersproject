import { gsap } from 'gsap/dist/gsap';

export const box = (el: HTMLElement) => {
    // prevent double animation
    if (el.classList.contains('is-animated')) return;

    const bg = el.querySelector('.box__bg');
    const children: Element[] = [...el.children].filter(child => child !== bg);

    gsap.fromTo(children, { y: window.innerHeight / 5 }, {
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        clearProps: 'all',
        scrollTrigger: {
            trigger: el,
            pinSpacing: false,
            start: 'top bottom',
            invalidateOnRefresh: true,
        },
    });

    gsap.fromTo(bg, { y: window.innerHeight / 5 }, {
        y: 0,
        duration: 0.4,
        ease: 'power2.out',
        clearProps: 'all',
        scrollTrigger: {
            trigger: el,
            pinSpacing: false,
            start: 'top bottom',
            invalidateOnRefresh: true,
        },
    });
};
