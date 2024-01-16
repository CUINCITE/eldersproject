import { AudioPlayer } from './components/AudioPlayer';

export class Menu {
    private isOpen = false;

    private elToggle: HTMLElement;
    private closeBtn: HTMLButtonElement;
    private wrapEl: HTMLElement;
    private isAnimating = false;


    // eslint-disable-next-line no-unused-vars
    constructor(protected view: HTMLElement) {
        this.elToggle = document.querySelector('.js-toggle-menu');
        this.closeBtn = this.view.querySelector('.js-menu-close');
        this.wrapEl = document.getElementById('wrapper');

        this.bind();
    }



    public onState(): void {
        this.isOpen && this.close();
    }



    private bind(): void {
        this.elToggle && this.elToggle.addEventListener('click', this.onToggle);
        this.closeBtn && this.closeBtn.addEventListener('click', this.close);

        // on close menu animation's end (related to whole #content toggle animation) set display: none for menu
        this.wrapEl.addEventListener('transitionend', () => {
            this.onAnimationEnd();
        });
    }



    private onAnimationEnd = (): void => {
        this.isAnimating = false;
        if (!this.isOpen) {
            this.view.style.display = 'none';
        }
    };



    private onToggle = (): void => {
        this.isOpen ? this.close() : this.open();
    };



    private open = (): void => {
        if (this.isAnimating) return;

        this.isAnimating = true;
        this.isOpen = true;
        this.view.style.display = 'flex';
        document.body.classList.add('has-menu-open');
        AudioPlayer.closeAudioPlayer();
    };



    private close = (): void => {
        if (this.isAnimating) return;

        this.isAnimating = true;
        this.isOpen = false;
        document.body.classList.remove('has-menu-open');
    };
}
