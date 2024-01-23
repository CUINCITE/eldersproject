/* eslint-disable max-classes-per-file */
import { normalizeUrl } from './Utils';
import Scroll from './Scroll';
import { Handler } from './Handler';

export class PushStatesEvents {
    public static CHANGE = 'state';
    public static PROGRESS = 'progress';
}


export class PushStates extends Handler {



    // eslint-disable-next-line no-use-before-define
    public static instance: PushStates;
    public static readonly TIME_LIMIT = 10000;
    private static initialHistoryLength: number;
    private static noChange = false;



    /** change document title */
    public static setTitle(title?: string): void {
        const content: HTMLElement = document.getElementById('content');
        const dataTitle: HTMLElement = content.querySelector('[data-title]');

        document.title = title || dataTitle.dataset.title;
    }



    /** change loaction pathname and trigger History */
    public static goTo(location: string, replace?: boolean): boolean {
        const pathname = location.replace(window.location.protocol + window.location.host, '');
        const isDifferent = pathname !== window.location.pathname;

        if (replace) {
            window.history.replaceState({ randomData: Math.random() }, document.title, pathname);
        } else {
            window.history.pushState({ randomData: Math.random() }, document.title, pathname);
        }

        PushStates.instance.onState();

        return isDifferent;
    }



    /** only change loaction pathname without triggering History */
    public static changePath(location: string, replace?: boolean, title?: string): void {
        PushStates.noChange = true;
        const changed = PushStates.goTo(location, replace || true);
        PushStates.noChange = false;

        if (changed) {
            PushStates.setTitle(title || document.title);
        }
    }



    /** bind links to be used with PushStates / History */
    public static bind(target?: Element, elementItself?: boolean): void {
        if (!elementItself) {
            PushStates.instance.bindLinks(target);
        } else {
            PushStates.instance.bindLink(target as Element);
        }
    }



    /**
     * go back in browser history
     * @param {string} optional fallback url (when browser deoesn't have any items in history)
     */
    public static back(url?: string): void {
        if (window.history.length - PushStates.initialHistoryLength > 0) {
            window.history.back();
        } else if (url) {
            window.history.replaceState({ randomData: Math.random() }, document.title, url);
            PushStates.instance.onState();
        } else {
            window.history.replaceState({ randomData: Math.random() }, document.title, '/');
            PushStates.instance.onState();
        }
    }



    public static reload(): void {
        PushStates.instance.trigger(PushStatesEvents.CHANGE);
    }



    private loadedData: string;
    private request: XMLHttpRequest;
    private timeout: ReturnType<typeof setTimeout>;
    private currentUrl: string;



    constructor() {
        super();

        this.bindLinks();

        window.addEventListener('popstate', this.onState, { passive: true });

        /**
         * Set scrollRestoration to 'manual' so the scroll doesn't jump
         * when back button is pressed.
         */
        window.history.scrollRestoration = 'manual';
        setTimeout(() => { window.history.scrollRestoration = 'manual'; }, 1000);

        PushStates.instance = this;
        PushStates.initialHistoryLength = window.history.length;
        this.currentUrl = normalizeUrl(window.location.pathname + window.location.search);

        this.setActiveLinks();
    }


    /**
     * load new content via ajax based on current location:
     * @return {Promise<boolean>} promise resolved when XMLHttpRequest is finished
     */
    public load(): Promise<void> {
        // cancel old request:
        if (this.request) {
            this.request.abort();
        }

        // define url
        const { pathname } = window.location;
        const search: string = window.location.search || '';
        const url = pathname + search;

        // define timeout
        window.clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            if (this.request) {
                window.location.reload();
            }
        }, PushStates.TIME_LIMIT);

        // return promise
        // and do the request:
        return new Promise<void>((resolve, reject) => {
            // do the usual xhr stuff:
            this.request = new XMLHttpRequest();
            this.request.open('GET', url);
            this.request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

            // onload handler:
            this.request.onload = () => {
                if (this.request.status === 200) {
                    this.loadedData = this.request.responseText;
                    this.currentUrl = normalizeUrl(url);

                    this.trigger(PushStatesEvents.PROGRESS, 1);
                    resolve();
                } else {
                    reject(Error(this.request.statusText));

                    if (this.request.statusText !== 'abort') {
                        window.location.reload();
                    }
                }

                this.request = null;
                window.clearTimeout(this.timeout);
            };

            // catching errors:
            this.request.onerror = () => {
                reject(Error('Network Error'));
                window.clearTimeout(this.timeout);
                this.request = null;
            };

            // catch progress
            this.request.onprogress = e => {
                if (e.lengthComputable) {
                    this.trigger(PushStatesEvents.PROGRESS, e.loaded / e.total);
                }
            };

            // send request:
            this.request.send();
        });
    }


    /**
     * tells if rendered html match current pathname
     */
    public isRendered(pathname?: string): boolean {
        return this.currentUrl === normalizeUrl(pathname || window.location.pathname + window.location.search);
    }


    /** function called on successful data load */
    public render(): void {
        const data: string = this.loadedData.trim();
        const containers = document.querySelectorAll('.js-replace[id], #content');
        let renderedCount = 0;


        // render each of containers
        // if only one container, force `plain`
        if (containers.length > 0) {
            containers.forEach((container, index): void => {
                const force = index === 0 && containers.length === 1;
                renderedCount += this.renderElement(container as HTMLElement, data, force) ? 1 : 0;
            });
        }


        // re-try rendering if none of containers were rendered:
        if (renderedCount === 0 && containers.length > 0) {
            this.renderElement(document.getElementById('content'), data, true);
        }

        this.bindLinks();
        this.setActiveLinks();

        // dispatch global event for serdelia CMS:
        window.document.dispatchEvent(new Event('ajax_loaded'));

        // fix browser scroll history cache
        window.history.scrollRestoration = 'manual';
        setTimeout(() => { window.history.scrollRestoration = 'manual'; }, 1000);
    }



    private renderElement(el: HTMLElement, data: string, forcePlain?: boolean): boolean {

        let code: string = null;

        if (!el.id) { console.warn('Rendered element must have an `id` attribute!'); return false; }

        const container = `#${el.id}`;

        // if ajax returns only <article> element:
        if (!!forcePlain && data.indexOf('<article') === 0 && el.id === 'content') {
            code = data;
        } else { // if ajax returns whole html:
            const parser = new DOMParser();
            const htmlDocument = parser.parseFromString(data, 'text/html');
            const foundElement = htmlDocument.documentElement.querySelector(container);
            code = foundElement ? foundElement.innerHTML : null;
        }

        if (!code) {
            console.info(`Couldn't rerender #${el.id} element`);
            return false;
        }

        const containerEl: HTMLElement = document.getElementById(el.id);

        containerEl.style.display = 'none';
        while (containerEl.firstChild) containerEl.removeChild(containerEl.firstChild);
        containerEl.innerHTML = code || data;
        containerEl.style.display = 'block';

        return true;
    }



    /** bind links */
    private bindLink(target: Element): void {
        target.removeEventListener('click', this.onClick);
        target.addEventListener('click', this.onClick);
    }



    /** bind links */
    private bindLinks(target?: Element): void {
        const t = target ?? document.body;

        // eslint-disable-next-line max-len
        const links = t.querySelectorAll('a:not([data-history="false"]):not([data-component="More"]):not([data-api]):not([download]):not([data-modal]):not([href^="#"]):not([href$=".jpg"]):not([target="_blank"]):not([href^="mailto:"]):not([href^="tel:"]):not([data-poczta]):not([data-login]):not([data-lang]):not([data-more]):not([data-filters])');

        links.forEach(el => {
            el.removeEventListener('click', this.onClick);
            el.addEventListener('click', this.onClick);
        });
    }



    /** links click handler */
    private onClick = (e: Event): void => {
        e.preventDefault();

        const self: HTMLElement = e.currentTarget as HTMLElement;
        const state: string = self.getAttribute('href').replace(`http://${window.location.host}`, '');
        const type: string = self.dataset.history;

        if (type === 'back') {
            PushStates.back(state);
        } else if (type === 'replace') {
            window.history.replaceState({ randomData: Math.random() }, document.title, state);
            this.onState();
        } else {
            Scroll.resetScrollCache(state);
            window.history.pushState({ randomData: Math.random() }, document.title, state);
            this.onState();
        }
    };



    /** `statechange` event handler */
    private onState = (): void => {
        this.setActiveLinks();

        if (!PushStates.noChange) {
            this.trigger(PushStatesEvents.CHANGE);
        }
    };



    /** mark links as active */
    private setActiveLinks(): void {
        [...document.querySelectorAll('a[href]')].map(el => el.classList.remove('is-active'));

        [...document.querySelectorAll(`a[href^="${window.location.pathname}"]`)]
            .forEach(el => el.classList.add('is-active'));

        const path = `/${window.location.pathname.split('/')[1]}`;
        [...document.querySelectorAll(`.nav a[href^="${path}"]`)]
            .forEach(el => {
                (el as HTMLAnchorElement)?.href !== '/' && el.classList.add('is-active');
            });
    }
}
