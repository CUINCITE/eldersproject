import gsap from 'gsap';

export const hero = el => {
    gsap.to(el.children, {
        y: () => el.clientHeight / -2,
        ease: 'none',
        scrollTrigger: {
            trigger: el,
            scrub: true,
            start: 'top top',
            end: 'bottom top',
        },
    });
};
