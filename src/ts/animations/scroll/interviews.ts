import { gsap } from 'gsap/dist/gsap';

export const interviews = el => {

    const controls = el.querySelector('.js-panel');
    const moreInterviews = el.querySelector('.interviews__more');

    if (controls) {
        const mm = gsap.matchMedia();

        mm.add('(orientation: landscape)', () => {
            gsap.timeline({
                ease: 'none',
                scrollTrigger: {
                    trigger: el,
                    pin: controls,
                    pinSpacing: false,
                    start: 'top top',
                    end: () => `bottom ${controls.offsetHeight + (moreInterviews?.offsetHeight ?? 0)}px`,
                    onToggle: self => {
                        el.classList.toggle('is-pinned', self.isActive);
                    },
                    onLeaveBack: self => {
                        setTimeout(() => {
                            self.refresh();
                        }, 500);
                    },
                    invalidateOnRefresh: true,
                },
            });
        });
    }
};
