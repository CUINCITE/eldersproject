import { gsap } from 'gsap/dist/gsap';
import { SplitText } from 'gsap/dist/SplitText';
import { easing } from '../../Site';

gsap.registerPlugin(SplitText);

export const claim = el => {


    const splittedText = new SplitText(el.querySelector('p'), { type: 'lines, words', linesClass: 'line' });
    gsap.set(splittedText.words, { yPercent: 105 });

    gsap.fromTo(splittedText.words, { yPercent: 105 }, {
        yPercent: 0,
        duration: 0.85,
        ease: easing,
        delay: 1,
        stagger: 0.03,
        onStart: () => {
            gsap.set(el, { opacity: 1 });
            console.log('start');
        },
        onComplete: () => {
            splittedText.revert();
        },
        scrollTrigger: {
            trigger: el,
            pinSpacing: false,
            start: 'top bottom',
            invalidateOnRefresh: true,
        },
    });
};
