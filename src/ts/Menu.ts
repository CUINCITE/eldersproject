import { gsap } from 'gsap/dist/gsap';

export class Menu {
    private isAnimating = false;

    private isOpen = false;

    private elToggle: HTMLElement;
    private elHeaderLogo: HTMLElement;
    // eslint-disable-next-line no-undef
    private elNavItems: NodeListOf<HTMLElement>;

    private duration = 0.6;

    // eslint-disable-next-line no-unused-vars
    constructor(protected view: HTMLElement) {
        this.elToggle = document.querySelector('.js-toggle-menu');
        this.elNavItems = this.view.querySelectorAll('.js-nav-item');
        this.elHeaderLogo = document.querySelector('.js-header-logo');


        this.bind();
    }

    public onState(): void {
        if (this.isOpen) {
            this.close();
        }
    }

    private bind(): void {
        this.elToggle && this.elToggle.addEventListener('click', this.onToggle);

        const elements = [...this.elNavItems, this.elHeaderLogo].filter(el => !!el);

        elements.length > 0 && elements.forEach(el => {
            el.addEventListener('click', () => {
                this.close();
            });
        });
        document.addEventListener('click', this.onClickAnywhere);
    }

    private onToggle = (): void => {
        if (this.isAnimating) {
            return;
        }
        // eslint-disable-next-line no-unused-expressions
        this.isOpen ? this.close() : this.open();
    };

    private onClickAnywhere = (event: MouseEvent): void => {
        if (!this.isOpen) {
            return;
        }
        const isClickInside = this.view.contains(<Node>event.target);
        const isClickHamburger = this.elToggle.contains(<Node>event.target);

        if (!isClickInside && !isClickHamburger) {
            this.close();
        }
    };

    private open(): void {
        this.isAnimating = true;
        this.isOpen = true;
        this.view.style.display = 'flex';


        gsap.to(this.view, {
            opacity: 1,
            duration: this.duration,
            ease: 'power2.out',
            onComplete: () => {
                this.isAnimating = false;
            },
        });
    }

    private close(): void {
        this.isAnimating = true;
        this.isOpen = false;


        gsap.to(this.view, {
            opacity: 0,
            duration: this.duration,
            ease: 'power2.out',
            onComplete: () => {
                this.view.style.display = 'none';
                this.isAnimating = false;
            },
        });
    }
}
