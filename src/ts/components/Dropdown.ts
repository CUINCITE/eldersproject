import { gsap } from 'gsap/dist/gsap';
import { Component } from './Component';
import { breakpoint } from '../Site';


export class Dropdown extends Component {
    private elSelect: HTMLSelectElement;
    // eslint-disable-next-line no-undef
    private elOptions: NodeListOf<HTMLOptionElement>;
    private elList: HTMLElement;
    private elWrap: HTMLElement;
    // eslint-disable-next-line no-undef
    private elItems: NodeListOf<HTMLElement>;
    private elToggle: HTMLElement;
    private elToggleCurrent: HTMLElement;
    private isOpen = false;


    constructor(protected view: HTMLElement) {
        super(view);
        this.elSelect = document.querySelector('select');
        this.elOptions = this.elSelect.querySelectorAll('option');
        this.elToggle = this.view.parentElement.querySelector('.js-dropdown-toggle');
        this.elToggleCurrent = this.elToggle.querySelector('.js-dropdown-current');
        this.build();
    }


    private build(): void {
        let html = '<div class="dropdown__wrap js-dropdown-wrap"><div class="dropdown__list js-dropdown-list">';
        this.elOptions.forEach(option => {
            const isDisabled = option.disabled ? ' is-disabled' : '';
            const isSelected = option.selected ? ' is-selected' : '';
            const results = '';

            html += `
                <button class="dropdown__option js-dropdown-option${isDisabled}${isSelected}">
                    ${option.text}${results}
                </button>`;
        });

        html += '</div></div>';
        this.view.innerHTML = html;
        this.elList = this.view.querySelector('.js-dropdown-list');
        this.elWrap = this.view.querySelector('.js-dropdown-wrap');
        this.elItems = this.view.querySelectorAll('.js-dropdown-option');
        this.bind();
    }

    private bind(): void {
        this.elItems.forEach(item => item.addEventListener('click', this.onItemClick));
        document.addEventListener('click', this.onClickAnywhere);
        this.elToggle.addEventListener('click', this.onToggleClick);
        this.elSelect.addEventListener('change', this.onSelectChange);
        this.preventScroll();
    }

    private onSelectChange = (): void => {
        const index = this.elSelect.selectedIndex;
        this.elItems.forEach(item => item.classList.remove('is-selected'));
        this.elItems[index].classList.add('is-selected');
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
            // this.setActiveLink(el);
            this.elToggleCurrent.innerHTML = el.innerHTML;
            this.elSelect.dispatchEvent(new Event('change'));
            this.view.parentElement.classList.add('is-selected');
        }
    };

    private onToggleClick = e => {
        e.preventDefault();
        e.stopPropagation();
        if (!this.isOpen) {
            this.open();
        } else {
            this.close();
        }
    };

    private close(): void {
        this.isOpen = false;
        this.view.classList.remove('is-open');
        // this.updateList();
        // this.updateTogglePosition();
        gsap.to(this.elWrap, {
            duration: 0.3,
            // y: 0,
            height: breakpoint.desktop ? 0 : 0,
            ease: 'power2.out',
        });
    }

    private open(): void {
        this.isOpen = true;
        this.view.classList.add('is-open');
        // this.updateList();
        // this.updateTogglePosition();
        gsap.to(this.elWrap, {
            duration: 0.3,
            height: this.elList.clientHeight,
            // y: -(this.elList.clientHeight - (breakpoint.desktop ? 50 : 35)),
            ease: 'power2.out',
            onComplete: (): void => {
            },
        });
    }

    private onClickAnywhere = (event: MouseEvent): void => {
        if (!this.isOpen) { return; }
        const isClickInside = this.elWrap.contains(<Node>event.target);
        if (!isClickInside) {
            this.close();
        }
    };


    private preventScroll = (): void => {
        const list = this.view.querySelector('.js-dropdown-wrap');

        // list.addEventListener('mousemove', () => {
        //     (window as any).smoother.paused(true);
        // });
    };

    // private updateList(): void {
    //     const y = this.isOpen ? 0 : -[...this.elItems].filter(el => el.matches('.is-selected'))[0].offsetTop;
    //     gsap.to(this.elList, {
    //         duration: 0.3,
    //         ease: 'power2.out',
    //         y: y,
    //     });
    // }

    // private updateTogglePosition(): void {
    //     const y = this.isOpen ? [...this.elItems].filter(el => el.matches('.is-selected'))[0].offsetTop : 0;
    //     gsap.to(this.elToggle, {
    //         duration: 0.3,
    //         ease: 'power2.out',
    //         y: y,
    //     });
    // }

    // private setActiveLink = (el): void => {
    //     for (const option of this.elOptions) {
    //         option === el
    //         ? el.classList.add('is-active')
    //         : el.classList.remove('is-active')
    //     }
    // }
}
