/* eslint-disable no-param-reassign */
/* eslint-disable max-len */


export function generateUID(): string {
    return `${(new Date()).getTime()}${Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)}`;
}



export const debounce = (callback: Function, timeout: number = 300) => {
    let timeoutId = null;

    return (...args) => {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
            // eslint-disable-next-line
            callback.apply(null, args);
        }, timeout);
    };
};


export function setAppHeight(): void {
    document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
}


export function setVwUnit(): void {
    document.documentElement.style.setProperty('--vw', `${document.documentElement.clientWidth}px`);
}


// eslint-disable-next-line no-undef
export function stats(): Stats {
    // eslint-disable-next-line no-undef
    const stats = new Stats(); // eslint-disable-line no-shadow

    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    stats.dom.style.pointerEvents = 'none';
    document.body.appendChild(stats.dom);

    function animate(): void {
        stats.begin();
        // monitored code goes here
        stats.end();
        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);

    return stats;
}


/**
 * Cover canvas with image
 * By Ken Fyrstenberg Nilsen
 * If image and context are only arguments rectangle will equal canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLImageElement}         img
 * @param {number}                   x
 * @param {number}                   y
 * @param {number}                   w
 * @param {number}                   h
 * @param {number}                   offsetX 0..1
 * @param {number}                   offsetY 0..1
 */
export function drawImageProp(ctx: CanvasRenderingContext2D, img: HTMLImageElement, iw: number, ih: number, x?: number, y?: number, w?: number, h?: number, offsetX?: number, offsetY?: number): void {
    if (arguments.length === 4) {
        // eslint-disable-next-line no-multi-assign
        x = y = 0;
        w = ctx.canvas.width;
        h = ctx.canvas.height;
    }

    // default offset is center
    offsetX = typeof offsetX === 'number' ? offsetX : 0.5;
    offsetY = typeof offsetY === 'number' ? offsetY : 0.5;

    // keep bounds [0.0, 1.0]
    if (offsetX < 0) { offsetX = 0; }
    if (offsetY < 0) { offsetY = 0; }
    if (offsetX > 1) { offsetX = 1; }
    if (offsetY > 1) { offsetY = 1; }


    const r = Math.min(w / iw, h / ih);
    let nw = iw * r; // new prop. width
    let nh = ih * r; // new prop. height
    let cx; let cy; let cw; let ch; let
        ar = 1;

    // decide which gap to fill
    if (nw < w) { ar = w / nw; }
    if (Math.abs(ar - 1) < 1e-14 && nh < h) { ar = h / nh; } // updated
    nw *= ar;
    nh *= ar;

    // calc source rectangle
    cw = iw / (nw / w);
    ch = ih / (nh / h);

    cx = (iw - cw) * offsetX;
    cy = (ih - ch) * offsetY;

    // make sure source rectangle is valid
    if (cx < 0) { cx = 0; }
    if (cy < 0) { cy = 0; }
    if (cw > iw) { cw = iw; }
    if (ch > ih) { ch = ih; }

    // fill image in dest. rectangle
    ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
}


export const clearThree = (obj: any): void => {
    if (!obj) { return; }
    if (!obj.children) { return; }
    while (obj.children.length > 0) {
        clearThree(obj.children[0]);
        obj.remove(obj.children[0]);
    }

    if (obj.geometry) { obj.geometry.dispose(); }

    if (obj.material) {
        Object.keys(obj.material).forEach(prop => {
            if (!obj.material[prop]) {
                return;
            }
            if (obj.material[prop] !== null && typeof obj.material[prop].dispose === 'function') {
                obj.material[prop].dispose();
            }
        });
        obj.material.dispose();
    }
};

export function lon2tile(lon: number, zoom: number): number {
    return Math.floor(((lon + 180) / 360) * 2 ** zoom);
}


export function lat2tile(lat: number, zoom: number): number {
    return Math.floor(
        ((1
            - Math.log(
                Math.tan((lat * Math.PI) / 180)
                    + 1 / Math.cos((lat * Math.PI) / 180),
            )
                / Math.PI)
            / 2)
            * 2 ** zoom,
    );
}


export function getImgFromMapbox(zoom: number, lon: number, lat: number, style: string, token: string): string {
    const z = Math.floor(zoom - 0.5);

    const x = lon2tile(lon, z);
    const y = lat2tile(lat, z);


    const img = `<img src="https://api.mapbox.com/styles/v1/${style}/tiles/256/${z}/${x}/${y}?access_token=${token}" loading="lazy" alt="">`;

    return img;
}

export function nFormatter(num: number, digits: number) {
    const lookup = [
        { value: 1, symbol: '' },
        { value: 1e3, symbol: 'k' },
        { value: 1e6, symbol: 'MI' },
        { value: 1e9, symbol: 'G' },
        { value: 1e12, symbol: 'T' },
        { value: 1e15, symbol: 'P' },
        { value: 1e18, symbol: 'E' },
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    const item = lookup.slice().reverse().find(itemInner => num >= itemInner.value);
    return item ? (num / item.value).toFixed(digits).replace(rx, '$1') + item.symbol : '0';
}


export const keys = {
    enter: 13,
    esc: 27,
    space: 32,
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    pageUp: 33,
    pageDown: 34,
    end: 35,
    home: 36,
    minus: 109,
    plus: 107,
};

/* eslint-disable */
export function getScript(source: string, callback: () => void) {
    let script = document.createElement('script') as any;
    const prior = document.getElementsByTagName('script')[0];
    script.async = 1;
    script.onload = script.onreadystatechange = function (_, isAbort) {
        if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) {
            script.onload = script.onreadystatechange = null;
            script = undefined;

            if (!isAbort && callback) setTimeout(callback, 0);
        }
    };

    script.src = source;
    prior.parentNode.insertBefore(script, prior);
}
/* eslint-enable */

/*!
 * Serialize all form data into an object of key/value pairs
 * (c) 2020 Chris Ferdinandi, MIT License, https://gomakethings.com
 * @param  {Node}   form The form to serialize
 * @return {Object}      The serialized form data
 */
export const serializeObject = (form: HTMLFormElement) => {
    const obj = {};
    Array.prototype.slice.call(form.elements).forEach(field => {
        if (!field.name || field.disabled || ['file', 'reset', 'submit', 'button'].indexOf(field.type) > -1) return;
        if (field.type === 'select-multiple') {
            const options = [];
            Array.prototype.slice.call(field.options).forEach(option => {
                if (!option.selected) return;
                options.push(option.value);
            });
            if (options.length) {
                obj[field.name] = options;
            }
            return;
        }
        if (['checkbox', 'radio'].indexOf(field.type) > -1 && !field.checked) return;
        obj[field.name] = field.value;
    });
    return obj;
};


export const zeroPad = (num: number, places: number): string => {
    const zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join('0') + num;
};


export const wait = (time: number): Promise<void> => new Promise(resolve => {
    setTimeout(() => resolve(), time);
});


export function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}


export function normalizeUrl(url: string): string {
    // without search query parameter - needed for reloading search results' page with different query
    return `/${url.replace(/#.*$/, '').replace(/^\/|\/$/g, '')}`;

    // old version - let's leave it just in case
    // return `/${url.replace(/#.*$/, '').replace(/^\/|\/$/g, '').replace(/\?.*$/, '')}`;
}


export const getQueryString = (forms: HTMLFormElement | HTMLFormElement[]): string => {

    const formData = new FormData();

    (Array.isArray(forms) ? forms : [forms])
        .filter((e, i, a) => a.indexOf(e) === i) // remove duplicates
        .forEach(form => {
            new URLSearchParams(new FormData(form) as any)
                .forEach((value, key) => formData.append(key, value));
        });


    const formParams = new URLSearchParams(formData as any);

    // filter empty values from form
    const keysForDel = [];
    formParams.forEach((value, key) => {
        if (!value) keysForDel.push(key);
    });

    // remove empty fields from query
    keysForDel.forEach(key => formParams.delete(key));

    // set new URLSearchParams Object for final converted data
    const finalFormData: URLSearchParams = new URLSearchParams();

    // when query has same name parameters with different values (eg multi checkboxes), merge values into one key (for URL prettify & backend purposes)
    formParams.forEach((value, key) => {
        if (finalFormData.has(key)) {
            finalFormData.set(key, `${finalFormData.get(key)},${value}`);
        } else finalFormData.set(key, value);
    });


    return decodeURIComponent(finalFormData.toString());
};



export function removeTags(str) {
    if ((str === null) || (str === '')) return false;
    // eslint-disable-next-line no-param-reassign
    str = str.toString();

    // Regular expression to identify HTML tags in
    // the input string. Replacing the identified
    // HTML tag with a null string.
    return str.replace(/(<([^>]+)>)/ig, '');
}



export function setStorageItem(key: string, value: string): void {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        console.warn(error);
    }
}


export function getStorageItem(key: string): string {
    return localStorage.getItem(key);
}
