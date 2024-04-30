import gsap from 'gsap';
import { Component } from '../../components/Component';

declare let ScrollToPlugin;
gsap.registerPlugin(ScrollToPlugin);

export class LightboxContents extends Component {

    private contentParts: NodeListOf<HTMLElement>;
    private currentHighlightedPart: HTMLElement;
    private scrollContainer: HTMLElement;
    private header: HTMLElement;


    constructor(protected view: HTMLElement) {
        super(view);


        this.contentParts = this.view.querySelectorAll('.js-contents-part');
        this.scrollContainer = this.view.querySelector('.js-scrolled');
        this.header = this.view.querySelector('.js-contents-header');
    }



    public update = (time: number): void => {
        const currentPart = this.getCurrentPart(time);
        this.highlightCurrentPart(currentPart);
    };



    private getCurrentPart = (time: number): HTMLElement => [...this.contentParts].filter(item => parseInt((item.querySelector('[data-start]') as HTMLElement).dataset.start, 10) <= time).pop();



    private highlightCurrentPart = (currentPart: HTMLElement): void => {
        if (!currentPart) return;
        if (currentPart === this.currentHighlightedPart) return;

        this.currentHighlightedPart = currentPart;
        [...this.contentParts].forEach(part => part.classList.remove('is-current'));
        currentPart.classList.add('is-current');
        this.scrollToElement(currentPart, false);
    };



    private scrollToElement = (element: HTMLElement, fast: boolean): void => {
        gsap.to(this.scrollContainer, {
            scrollTo: {
                y: element,
                offsetY: this.header.clientHeight,
            },
            duration: fast ? 0.01 : 1,
            ease: 'power2.inOut',
        });
    };
}
