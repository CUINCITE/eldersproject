import Scroll from '../Scroll';
import { Component } from './Component';


interface ILoadSettings {
    contentSelector: string;
}


export class FilterLetters extends Component {

    // eslint-disable-next-line no-use-before-define
    public static instance: FilterLetters;

    public static checkButtons(): void {
        FilterLetters.instance.checkButtons();
    }


    private settings: ILoadSettings;
    private contentElement: HTMLElement;
    private buttons: NodeListOf<HTMLElement>;
    private scrolledItems: NodeListOf<HTMLElement>;



    constructor(protected view: HTMLElement) {
        super(view);

        FilterLetters.instance = this;

        this.settings = { ...this.settings, ...JSON.parse(this.view.getAttribute('data-options')) };
        this.contentElement = document.querySelector(this.settings.contentSelector);
        this.buttons = this.view.querySelectorAll('.js-letter');

        this.bind();
        this.checkButtons();
    }



    protected bind(): void {
        [...this.buttons].map(btn => btn.addEventListener('click', this.onButtonClick));
    }



    private onButtonClick = (e): void => {

        const button: HTMLElement = e.currentTarget;
        const { letter } = button.dataset;

        const letterItem: HTMLElement = [...this.scrolledItems].find(item => this.getFirstLetter(item) === letter.toLowerCase());

        if (!letterItem) {
            console.warn('There is no item starting with letter "%s"!', letter);
            return;
        }

        Scroll.scrollTo({
            el: letterItem,
            offsetY: this.view.closest('.js-controls').clientHeight - 1, // prevent double border
        });
    };



    private checkButtons(): void {
        this.scrolledItems = this.contentElement.querySelectorAll('.js-tile');

        [...this.buttons].forEach(button => {
            const { letter } = button.dataset;

            const letterItem: HTMLElement = [...this.scrolledItems].find(item => this.getFirstLetter(item) === letter.toLowerCase());

            button.classList.toggle('is-disabled', !letterItem);
        });
    }



    private getFirstLetter(item: HTMLElement): string {
        return item.dataset.name.toLowerCase().charAt(0);
    }
}
