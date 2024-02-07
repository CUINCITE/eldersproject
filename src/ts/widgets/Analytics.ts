/// <reference path="../definitions/ga.d.ts" />
/// <reference path="../Site.ts" />


declare let ga;
declare let gtag;
declare let dataLayer: Object[];

type GAEventParams = {
    [key: string]: any;
    event: string;
};

export class Analytics {

    public static TRACKING_ID: string;



    public static bind(where?: HTMLElement): void {
        [...(where || document).querySelectorAll('[data-ga]')].forEach(el => {
            el.addEventListener('click', this.sendGaData);
        });

        [...(where || document).querySelectorAll('[data-gtm]')].forEach(el => {
            el.addEventListener('click', this.sendGtmData);
        });
    }



    public static sendCustomEvent(data: GAEventParams): void {
        if (typeof gtag !== 'undefined' && data.event) {
            console.log('%cgtag tracking: event', 'background:#1a73e8;color:#fff', data);
            const eventLabel = data.event.replace(/-/g, '_');
            delete data.event;
            Object.keys(data).length ? gtag('event', eventLabel, data) : gtag('event', eventLabel);
        } else if (typeof dataLayer !== 'undefined') {
            dataLayer.push(data);
            console.log('%cgtm tracking: event', 'background:#1a73e8;color:#fff', data);
        }
    }



    public static sendEvent(category: string, action: string, label?: string, value?: number|string): void {
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: category,
                event_label: label,
                value,
            });
            console.log('%cgtag tracking: event', 'background:#1a73e8;color:#fff', category, action, label, value);
        } else if (typeof dataLayer !== 'undefined') {
            const data = {
                event: action,
                category,
                label: value,
            };
            dataLayer.push(data);
            console.log('%cgtm tracking: event', 'background:#1a73e8;color:#fff', category, action, label, value);
        } else if (typeof ga !== 'undefined') {
            ga('send', 'event', category, action, label, value);
            console.log('%cga tracking: event', 'background:#1a73e8;color:#fff', category, action, label, value);
        }
    }



    public static sendPageview(pathname?: string, title?: string): void {
        if (typeof dataLayer !== 'undefined') {
            dataLayer.push({
                event: 'pageview',
                // title: title || document.title,
                pathname: pathname || window.location.pathname,
            });
            console.log('%cgtm tracking: pageview', 'background:#1a73e8;color:#fff', pathname || window.location.pathname, title || document.title);
        } else if (typeof gtag !== 'undefined') {
            gtag('config', Analytics.TRACKING_ID, {
                page_path: pathname || window.location.pathname,
                page_title: title || document.title,
            });
            console.log('%cgtag tracking: pageview', 'background:#1a73e8;color:#fff', pathname || window.location.pathname, title || document.title);
        } else if (typeof ga !== 'undefined') {
            ga('send', 'pageview', pathname || window.location.pathname, {
                title: title || document.title,
                pathname: pathname || '',
            });
            console.log('%cga tracking: pageview', 'background:#1a73e8;color:#fff', pathname || window.location.pathname, title || document.title);
        }
    }

    public static sendGtmData(e): void {
        const data = JSON.parse((e.currentTarget as HTMLElement).dataset.gtm);
        Analytics.sendCustomEvent(data);
        console.log(data);
    }

    public static sendGaData(e): void {
        const data = JSON.parse((e.currentTarget as HTMLElement).dataset.ga);
        Analytics.sendEvent(data[0] || '', data[1] || '', data[2] || '', data[3] || -1);
    }
}
