import gsap from 'gsap';
import { Component } from '../../components/Component';
import * as Utils from '../../Utils';

declare let ScrollToPlugin;
gsap.registerPlugin(ScrollToPlugin);

export class LightboxTranscript extends Component {

    private searchForm: HTMLFormElement;
    private searchInput: HTMLInputElement;
    private inputWrap: HTMLElement;
    private fakeSpan: HTMLSpanElement;
    private langButton: HTMLButtonElement;
    private langWrappers: NodeListOf<HTMLElement>;
    private isMainLang = true;
    private activeLanguageWrap: HTMLElement;
    private foundElements: NodeListOf<HTMLElement>;
    private transcriptNavigation: HTMLElement;
    private currentMarkIndex: number;
    private transcriptNavNextButton: HTMLButtonElement;
    private transcriptNavPrevButton: HTMLButtonElement;
    private transcriptNavCloseButton: HTMLButtonElement;
    private transcriptScrollContainer: HTMLElement;

    constructor(protected view: HTMLElement) {
        super(view);

        this.searchForm = this.view.querySelector('.js-transcript-search');
        this.inputWrap = this.view.querySelector('.js-transcript-input-wrap');
        this.searchInput = this.searchForm.querySelector('input');
        this.fakeSpan = this.view.querySelector('.js-transcript-span');
        this.langButton = this.view.querySelector('.js-transcript-switch');
        this.langWrappers = this.view.querySelectorAll('.js-transcript-lang');
        this.activeLanguageWrap = this.view.querySelector('.js-transcript-lang.is-active');
        this.transcriptNavigation = this.view.querySelector('.js-transcript-nav');
        this.transcriptNavNextButton = this.view.querySelector('.js-transcript-next');
        this.transcriptNavPrevButton = this.view.querySelector('.js-transcript-prev');
        this.transcriptNavCloseButton = this.view.querySelector('.js-transcript-close');
        this.transcriptScrollContainer = this.view.querySelector('.js-scrolled');


        this.bind();
    }



    private bind = (): void => {
        this.searchInput.addEventListener('input', e => this.onKeyUp(e));
        this.searchForm.addEventListener('submit', e => this.onSubmit(e));
        this.langButton && this.langButton.addEventListener('click', this.onLangButtonClick);
        this.transcriptNavNextButton && this.transcriptNavNextButton.addEventListener('click', () => this.goTo(1));
        this.transcriptNavPrevButton && this.transcriptNavPrevButton.addEventListener('click', () => this.goTo(-1));
        this.transcriptNavCloseButton && this.transcriptNavCloseButton.addEventListener('click', this.closeNav);
    };



    private onKeyUp = (e): void => {
        // fake span is created to measure its' width & update input's width dynamically
        const inputValue: string = this.searchInput.value;
        this.updateInput(inputValue);
    };



    private updateInput = (value: string): void => {
        this.fakeSpan.innerText = value;
        const spanWidth = this.fakeSpan.scrollWidth;
        this.inputWrap.style.width = `${spanWidth}px`;
    };



    private goTo = (dir: number): void => {
        this.currentMarkIndex += dir;

        if (this.currentMarkIndex > this.foundElements.length) this.currentMarkIndex = 1;
        if (this.currentMarkIndex < 1) this.currentMarkIndex = this.foundElements.length;
        this.updateTranscriptNav();
    };



    private closeNav = (): void => {
        this.transcriptNavigation.classList.remove('is-active');
        this.searchInput.value = '';
        this.updateInput('');
        this.clearMarkedElements();
    };



    private onSubmit = (e): void => {
        e.preventDefault();
        this.findWordInTranscript();
    };



    private findWordInTranscript = (): void => {
        // get search value
        const inputValue: string = this.searchInput.value;

        // find all search value's results in transcript text, and wrap each in <mark> tag to highlight
        const searchElements: NodeListOf<HTMLElement> = this.activeLanguageWrap.querySelectorAll('.transcript__text');
        [...searchElements].forEach(elem => {
            elem.innerHTML = elem.innerHTML.replace(new RegExp(`${inputValue}(?!([^<]+)?<)`, 'gi'), '<mark>$&</mark>');
        });

        // store all found words
        this.foundElements = this.activeLanguageWrap.querySelectorAll('mark');

        // if found any words, declare words' counter and show nav
        if (this.foundElements.length) {
            this.transcriptNavigation.classList.add('is-active');
            this.currentMarkIndex = 1;
            this.updateTranscriptNav();
        }
    };



    private updateTranscriptNav = (): void => {
        // update nav numbers
        this.transcriptNavigation.querySelector('.js-transcript-counters').innerHTML = `${this.currentMarkIndex}/${this.foundElements.length}`;

        // find current selected item and scroll to it
        const selectedMark = this.foundElements[this.currentMarkIndex - 1];
        gsap.to(this.transcriptScrollContainer, {
            scrollTo: {
                y: selectedMark,
                offsetY: this.searchForm.clientHeight,
            },
            duration: 0.01,
            ease: 'power3.inOut',
        });
    };



    private onLangButtonClick = (e): void => {
        // get attributes from button to switch languages
        const button = e.currentTarget;
        const oldSlug = button.getAttribute(`data-${!this.isMainLang ? 'alternate' : 'main'}-lang`);
        const newSlug = button.getAttribute(`data-${this.isMainLang ? 'alternate' : 'main'}-lang`);

        // set old language as buttons'text
        button.innerText = oldSlug;

        this.isMainLang = !this.isMainLang;

        // hide old lang wrapper and show the new one
        this.activeLanguageWrap.classList.remove('is-active');

        const newActiveWrap = [...this.langWrappers].find(wrap => wrap.getAttribute('data-lang') === newSlug);
        newActiveWrap.classList.add('is-active');
        this.activeLanguageWrap = newActiveWrap;
    };



    private clearMarkedElements = (): void => {
        if (!this.foundElements.length) return;
        [...this.foundElements].forEach(elem => {
            elem.replaceWith(Utils.removeTags(elem.innerHTML));
        });
        this.foundElements = null;
    };
}