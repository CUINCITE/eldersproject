import { gsap } from 'gsap/dist/gsap';

export class Expand {
    public static bind(): void {
        document.querySelectorAll('[aria-controls]').forEach(element => {
            element.addEventListener('click', Expand.onAriaControlsClick);
        });
    }

    private static onAriaControlsClick = (e: Event): void => {
        e.preventDefault();
        e.stopPropagation();

        const that = e.currentTarget as HTMLElement;
        const id = that.getAttribute('aria-controls');
        const isExpanded = that.getAttribute('aria-expanded') === 'true';
        const target = document.querySelector(`#${id}`) as HTMLElement;

        target.style.position = 'relative';
        target.style.overflow = 'hidden';

        if (!isExpanded) {
            // expand:

            target.style.display = 'block';

            target.setAttribute('aria-hidden', 'false');
            const hgt = target.children[0].clientHeight;

            gsap.fromTo(target, { height: 0 }, {
                duration: hgt / 400,
                height: hgt,
                ease: 'power2.out',
                onComplete: (): void => {
                    that.setAttribute('aria-expanded', 'true');
                    window.dispatchEvent(new Event('resize'));
                },
            });

            if (that.getAttribute('data-aria-less')) {
                that.querySelector('.js-text').innerHTML = that.getAttribute('data-aria-less');
            }
        } else {
            // collapse:

            const hgt = target.clientHeight;
            gsap.to(target, {
                duration: hgt / 400,
                height: 0,
                ease: 'power2.out',
                onComplete: (): void => {
                    that.setAttribute('aria-expanded', 'false');
                    target.setAttribute('aria-hidden', 'true');
                    target.style.display = 'none';
                    window.dispatchEvent(new Event('resize'));
                },
            });

            if (that.getAttribute('data-aria-more')) {
                that.querySelector('.js-text').innerHTML = that.getAttribute('data-aria-more');
            }
        }
    };
}
