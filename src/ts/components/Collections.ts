import { Component } from './Component';


export class Collections extends Component {
    private allItems: NodeListOf<HTMLElement>;

    constructor(protected view: HTMLElement) {
        super(view);

        this.allItems = this.view.querySelectorAll('.js-accordeon-item');
        this.bind();
    }

    private bind(): void {
        this.allItems.forEach((item: HTMLElement) => {
            item.addEventListener('mouseenter', this.onItemEnter);
        });
    }



    private onItemEnter = (event: Event): void => {
        const target = event.target as HTMLElement;

        [...this.allItems].filter((item: HTMLElement) => item !== target).forEach(item => item.classList.remove('is-active'));
        target.classList.add('is-active');
    };
}
