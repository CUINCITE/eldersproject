export class Expand {

    public static resize = () => {
        this.setMaxHeight();
    };



    public static bind(): void {

        this.setMaxHeight();

        ([...document.querySelectorAll('[data-expand][id]')] as HTMLElement[]).forEach(element => {
            const toggleButton = document.querySelector(`[aria-controls="${element.id}"]`) as HTMLElement;
            toggleButton?.addEventListener('click', Expand.onAriaControlsClick);
            // console.log(element, toggleButton);
        });
    }



    public static unbind = (): void => {

        ([...document.querySelectorAll('[data-expand][id]')] as HTMLElement[]).forEach(element => {
            const toggleButton = element.querySelector('[aria-controls]') as HTMLElement;

            toggleButton?.removeEventListener('click', Expand.onAriaControlsClick);
        });
    };



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
    };



    private static collapse = (target: HTMLElement) => {
        target.setAttribute('aria-expanded', 'false');
        target.parentElement.classList.remove('is-expanded');
        (target.querySelector('.js-expand-text') as HTMLElement).innerText = target.getAttribute('data-hidden-text');
        document.getElementById(target.getAttribute('aria-controls')).classList.remove('is-expanded');
    };



    private static setMaxHeight = () => {
        ([...document.querySelectorAll('[data-expand][id]')] as HTMLElement[]).forEach(element => {
            const { height } = element.children[0].getBoundingClientRect();
            element.style.maxHeight = `${height}px`;
        });
    };
}
