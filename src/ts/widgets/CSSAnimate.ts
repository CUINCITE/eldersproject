/**
 * Fire single one-way animations on hover.
 *
 * Listeners are bound on `[data-cssanimate]` elements themselves
 * or on elements specified by selector passed in the dataset:
 * ```<div data-cssanimate=".js-child"><span class="js-child">```
 *
 * To fire the animation use `is-animating` class which is added on `mouseenter` event.
 * ```[data-cssanimate].is-animating { animation: customAnimation; }```
 *
 * It can be used with both: css-transition and css-animation;
 */

export class CSSAnimate {


    public static bind(where?: HTMLElement): void {
        [...(where || document).querySelectorAll('[data-cssanimate]')].forEach(el => {
            const selector = (el as HTMLElement).dataset.cssanimate;
            const target = selector ? el.querySelector(selector) : el;
            target?.addEventListener('transitionend', CSSAnimate.onAnimationEnd);
            target?.addEventListener('animationend', CSSAnimate.onAnimationEnd);
            el.addEventListener('mouseenter', CSSAnimate.onMouseEnter);
        });
    }


    private static onAnimationEnd = e => {
        e.target.closest('[data-cssanimate]').classList.remove('is-animating');
    };


    private static onMouseEnter = e => {
        e.currentTarget.classList.add('is-animating');
    };
}
