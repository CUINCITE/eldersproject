import { gsap } from 'gsap/dist/gsap';
import { CustomEase } from 'gsap/dist/CustomEase';
import Scroll from './Scroll';
import { pages as Pages } from './Classes';
import { stats, debounce, setAppHeight } from './Utils';
import { IBrowser, getBrowser } from './Browser';
import { IBreakpoint, getBreakpoint } from './Breakpoint';
import { PushStates, PushStatesEvents } from './PushStates';
import { Page, PageEvents } from './pages/Page';
import { Menu } from './Menu';
import { Search } from './Search';
import { AudioPlayer } from './components/AudioPlayer';
import { Lightbox } from './components/Lightbox/Lightbox';

import Widgets from './widgets/All';

export const local = !!window.location.hostname.match(/(localhost|\.lh|192\.168\.)/g);
export const debug = window.location.search.indexOf('debug') >= 0;

export let lang: string;
export let pixelRatio: number;
export let easing: string;
export let browser: IBrowser;
export let breakpoint: IBreakpoint;

gsap.registerPlugin(CustomEase);


class Site {

    private currentPage: Page;
    private pushStates: PushStates;
    private scroll: Scroll;
    private menu: Menu;
    private lightbox: Lightbox;
    private search: Search;
    private audioPlayer: AudioPlayer;

    private isInitialized: boolean = false;
    private resizingTimeout: ReturnType<typeof setTimeout>;



    public init(): void {

        console.group();

        breakpoint = getBreakpoint();
        browser = getBrowser();
        easing = CustomEase.create('custom', '0.5, 0, 0.1, 1');
        lang = document.documentElement.getAttribute('lang');
        pixelRatio = Math.min(2, window.devicePixelRatio || 1);

        this.bind();
        setAppHeight();
        debug && stats();

        this.pushStates = new PushStates();
        this.pushStates.on(PushStatesEvents.CHANGE, this.onState);

        this.scroll = new Scroll();

        this.lightbox = new Lightbox();
        this.menu = new Menu(document.querySelector('.js-menu'));
        this.search = new Search(document.getElementById('search'));

        this.audioPlayer = new AudioPlayer(document.querySelector('.js-audioplayer'));

        if (browser.ie) {
            console.warn('This browser is outdated!');
            return;
        }

        PushStates.setTitle();

        Promise.all<void>([
            this.setCurrentPage(),
            // preload other components if needed
        ]).then(this.onPageLoaded);
    }


    /**
     * add some general event listeners
     */
    private bind(): void {

        window.addEventListener('DOMContentLoaded', () => {
            document.body!.classList.add('is-loaded');
        });

        // delayed resize to prevent transitions:
        window.addEventListener('resize', () => {
            document.body.classList.add('is-resizing');
            clearTimeout(this.resizingTimeout);
            this.resizingTimeout = setTimeout(() => {
                this.onResize();
                document.body.classList.remove('is-resizing');
            }, 250);
        });

        window.addEventListener('orientationchange', debounce(() => this.onResize(true)));
    }


    /**
     * resize handler
     */
    private onResize = (isOrientationChanged?: boolean): void => {

        const oldBreakpoint = breakpoint ? breakpoint.value : null;
        breakpoint = getBreakpoint();

        const width = window.innerWidth;
        const height = window.innerHeight;
        const changed = oldBreakpoint !== breakpoint.value;

        !browser.touch && setAppHeight();
        isOrientationChanged && setAppHeight();

        this.currentPage?.resize(width, height, breakpoint, changed);
        (!browser.touch || changed) && Scroll?.resize();
    };


    /**
     * check if any component handle onState event
     * if not, reload html:
     */
    private onState = () => {
        const isRendered = this.pushStates.isRendered();
        const pageChangedState = this.currentPage.onState();
        const lightboxChangedState = this.lightbox.onState(isRendered);
        this.menu?.onState();
        this.search?.onState();

        if (!isRendered && !pageChangedState && !lightboxChangedState) {
            Promise.all<void>([
                this.pushStates.load(),
                this.currentPage.animateOut(),
            ]).then(this.render);
        }
    };


    /**
     * called after new html is loaded
     * and old content is animated out:
     */
    private render = async(): Promise<void> => {
        if (this.currentPage) {
            this.currentPage.off();
            this.currentPage.destroy();
            this.currentPage = null;
        }

        console.groupEnd();
        console.group();

        document.body.classList.add('is-rendering');
        PushStates.setTitle();
        this.pushStates.render();
        await this.setCurrentPage();
        this.onPageLoaded();
    };


    /**
     * when current page is loaded:
     */
    private onPageLoaded = async(): Promise<void> => {
        document.body.classList.remove('is-not-ready', 'is-rendering');
        this.currentPage.animateIn(0);
        !this.isInitialized && Scroll.scrollToTop(true);
        Scroll.scrollToCached();
        this.scroll.load();
        Scroll.start();
        PushStates.setTitle();
        this.isInitialized = true;
    };



    /**
     * run new Page object
     * (found by `data-page` attribute)
     * bind it and store as currentPage:
     */
    private setCurrentPage(): Promise<void> {
        const pageList: NodeList = document.querySelectorAll('[data-page]');
        let pageEl: HTMLElement = pageList[0] as HTMLElement;
        let pageName: string = pageEl.dataset.page || 'Page';
        const pageOptions: Object = pageEl.dataset.options;

        // page not found:
        if (Pages[pageName] === undefined) {
            if (pageName !== 'undefined') {
                console.warn('There is no "%s" in Pages!', pageName);
            }
            pageName = 'Page';
        }

        // more than one data-page:
        if (pageList.length > 1) {
            console.warn('Only one [data-page] element, please!');

        // page not defined in html:
        } else if (pageList.length === 0) {
            const articleEl = document.getElementById('content').querySelector('article');
            const contentEl = document.getElementById('content');
            pageEl = articleEl || contentEl!.firstChild as HTMLElement;
        }

        // set custom classes to body based on <article> parameters
        document.body.classList.toggle('is-404', Boolean(document.body.querySelector('[data-not-found]')));

        // create Page object:
        const page: Page = new Pages[pageName](pageEl, pageOptions);
        this.currentPage = page;

        // bind events:
        page.on(PageEvents.CHANGE, this.onPageAppend);

        // bind widgets:
        Widgets.bind();

        // update links:
        this.setActiveLinks();

        this.lightbox?.check();

        return page.preload();
    }


    /**
     * deal with newly added elements
     */
    private onPageAppend = (el: HTMLElement): void => {
        PushStates.bind(el);
        this.scroll.load();
    };


    /**
     * toggle active links with the page change
     */
    private setActiveLinks(): void {
        const anchors = document.querySelectorAll('a[href]');
        const pathname = window.location.pathname.replace(/\/+$/, '');

        [...anchors].forEach(anchor => {
            anchor.classList.remove('is-active');
        });

        document.querySelectorAll(`a[href="${pathname}/"], a[href="${pathname}"]`).forEach(link => link?.classList.add('is-active'));
    }
}



window.addEventListener('load', () => {
    const site = new Site();
    site.init();
});
