import { gsap } from 'gsap/dist/gsap';

export const interviews = el => {

    const controls = el.querySelector('.interviews-grid__controls');
    const moreInterviews = el.querySelector('.interviews__more');
    let moreInterviewsHeight = 0;
    if (moreInterviews) moreInterviewsHeight = moreInterviews.offsetHeight;

    controls && gsap.to(controls, {

        ease: 'none',
        scrollTrigger: {
            trigger: el,
            pin: controls,
            pinSpacing: false,
            start: 'top top',
            end: () => `bottom ${controls.offsetHeight + moreInterviewsHeight}px`,
            invalidateOnRefresh: true,
        },
    });

};
