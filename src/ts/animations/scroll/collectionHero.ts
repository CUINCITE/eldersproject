import gsap from 'gsap';

export const collectionHero = el => {
    gsap.set(el, {
        opacity: 0,
        transformOrigin: '50% 50%',
        yPercent: 100,
        rotate: -15,
    });


    gsap.fromTo(el, {
        yPercent: 100,
        rotate: -15,
    }, {
        yPercent: 0,
        rotate: 0,
        duration: 1,
        ease: 'power2.out',
        clearProps: 'transform',
        onStart: () => {
            el.style.opacity = '1';
        },
        scrollTrigger: {
            trigger: el,
            pinSpacing: false,
            start: 'top bottom',
            invalidateOnRefresh: true,
        },
    });
};
