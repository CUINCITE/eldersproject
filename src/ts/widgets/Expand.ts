export class Expand {



    public static resize = () => {
        this.setMaxHeight();
    };


    public static bind(where?: HTMLElement): void {

        this.setMaxHeight();

        ([...(where || document).querySelectorAll('[data-expand][id]')] as HTMLElement[])
            .forEach(element => {
                const toggleButton = document.querySelector(`[aria-controls="${element.id}"]`) as HTMLElement;
                toggleButton?.addEventListener('click', Expand.onAriaControlsClick);
            });
    }



    public static unbind(): void {
        ([...document.querySelectorAll('[data-expand][id]')] as HTMLElement[]).forEach(element => {
            const toggleButton = element.querySelector('[aria-controls]') as HTMLElement;
            toggleButton?.removeEventListener('click', Expand.onAriaControlsClick);
        });
    }



    private static onAriaControlsClick = (e: Event): void => {
        e.preventDefault();
        e.stopPropagation();

        const target = e.currentTarget as HTMLElement;
        const isExpanded = target.getAttribute('aria-expanded') === 'true';

        isExpanded ? this.collapse(target) : this.expand(target);
    };



    private static expand = (target: HTMLElement) => {
        target.setAttribute('aria-expanded', 'true');
        target.parentElement.classList.add('is-expanded');
        (target.querySelector('.js-expand-text') as HTMLElement).innerText = target.getAttribute('data-expanded-text');
        document.getElementById(target.getAttribute('aria-controls')).classList.add('is-expanded');

        target.dataset.scrollY = (target.getBoundingClientRect().top + window.scrollY).toString();
    };



    private static collapse = (target: HTMLElement) => {
        target.setAttribute('aria-expanded', 'false');
        target.parentElement.classList.remove('is-expanded');
        (target.querySelector('.js-expand-text') as HTMLElement).innerText = target.getAttribute('data-hidden-text');

        const elementTop = parseInt(target.dataset.scrollY, 10);

        if (target.classList.contains('text__expand-trigger') && elementTop < window.scrollY) {

            window.scrollTo({ top: elementTop - 100, behavior: 'smooth' });

            setTimeout(() => {
                document.getElementById(target.getAttribute('aria-controls')).classList.remove('is-expanded');
            }, 500);

        } else {
            document.getElementById(target.getAttribute('aria-controls')).classList.remove('is-expanded');
        }
    };



    private static setMaxHeight = () => {
        ([...document.querySelectorAll('[data-expand][id]')] as HTMLElement[]).forEach(element => {

            let height = 0;
            [...element.children].forEach(children => {
                height += children.getBoundingClientRect().height;
            });

            element.style.maxHeight = `${height}px`;
        });
    };

}
