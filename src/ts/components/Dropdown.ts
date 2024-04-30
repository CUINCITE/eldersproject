import { Component } from './Component';


export class Dropdown extends Component {
    private elSelect: HTMLSelectElement;
    // eslint-disable-next-line no-undef
    private elOptions: NodeListOf<HTMLOptionElement>;
    private elWrap: HTMLElement;
    private elToggle: HTMLElement;
    private elValue: HTMLElement;
    private elPanel: HTMLElement;
    // eslint-disable-next-line no-undef
    private elItems: NodeListOf<HTMLElement>;
    private isOpen = false;


    constructor(protected view: HTMLElement) {
        super(view);
        this.elSelect = this.view.querySelector('select');
        this.elToggle = this.view.querySelector('.js-toggle');
        this.elValue = this.view.querySelector('.js-value');
        this.elOptions = this.elSelect.querySelectorAll('option');
        this.elWrap = this.view.querySelector('.js-dropdown-wrap');
        this.elItems = this.view.querySelectorAll('.js-dropdown-option');
        this.elPanel = document.querySelector('.js-panel');

        this.bind();
        this.setWrapSize();
    }



    private bind(): void {
        // Widgets.bind();
        this.elItems.forEach(item => item.addEventListener('click', this.onItemClick));
        document.addEventListener('click', this.onClickAnywhere);
        this.elSelect.addEventListener('change', this.onSelectChange);
        this.elToggle && this.elToggle.addEventListener('click', this.onToggle);
    }



    private onToggle = e => {
        e.preventDefault();

        this.isOpen ? this.close() : this.open();
    };



    private onSelectChange = (): void => {
        const index = this.elSelect.selectedIndex;
        this.elItems.forEach(item => item.classList.remove('is-selected'));
        this.elItems[index].classList.add('is-selected');
        if (this.elValue) {
            const customValue = this.elOptions[index].dataset.value;
            this.elValue.innerHTML = customValue || this.elSelect.value;
            if (customValue === 'locations' || customValue === 'collections') {
                this.elPanel.classList.add('hide-letters');
            } else {
                this.elPanel.classList.remove('hide-letters');
            }
        }
        this.close();
    };



    private onItemClick = e => {
        e.preventDefault();


        if (!this.isOpen) {
            this.open();
        } else {
            const el = e.currentTarget;
            const index = [...el.parentElement.children].indexOf(el);
            this.elOptions[index].selected = true;
            this.elSelect.dispatchEvent(new Event('change'));
            this.elSelect.closest('form').dispatchEvent(new Event('input'));
            this.view.parentElement.classList.add('is-selected');
        }
    };



    private close(): void {
        this.isOpen = false;
        this.view.classList.remove('is-open');
    }



    private open(): void {
        this.isOpen = true;
        this.view.classList.add('is-open');
    }



    private onClickAnywhere = (event: MouseEvent): void => {
        if (!this.isOpen) { return; }
        const isClickInside = this.elWrap.contains(<Node>event.target) || this.elToggle.contains(<Node>event.target);
        if (!isClickInside) {
            this.close();
        }
    };



    private setWrapSize(): void {
        let width = 0;
        this.elItems.forEach(el => {
            if (width < el.clientWidth) { width = el.clientWidth; }
        });
        this.view.style.minWidth = `${width}px`;
    }
}
