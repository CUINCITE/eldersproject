/// <reference path="../definitions/imagesloaded.d.ts" />

import { debug, local } from '../Site';


export class Images {


    /**
     * preload images
     * @param {NodeListOf<HTMLImageElement>} imgElements images to preload
     * @return {Promise<void>} loading images promise
     */
    public static preload(imgElements: NodeListOf<HTMLImageElement>): Promise<void> {

        if (!imgElements || !imgElements.length) {
            return Promise.resolve();
        }

        return new Promise<void>(resolve => {
            const il = imagesLoaded(imgElements);
            (local || debug) && il.on('progress', () => console.log(il));
            il.on('always', () => resolve());
        });

    }


    /**
     * listen to all images loaded event
     * mark them as loaded
     */
    public static bind(where?: HTMLElement): void {
        const il = imagesLoaded(where || document.body);
        il.on('progress', Images.onProgress);
    }


    /**
     * imagesLoaded successful callback
     */
    private static onProgress = (instance, { img, isLoaded }) => {
        if (isLoaded && img.naturalWidth > 0 && img.naturalHeight > 0) {
            img.classList.remove('is-loading');
            img.classList.add('is-loaded');
            img.closest('figure')?.classList.add('is-loaded');
            img.closest('.image')?.classList.add('is-loaded');
        }
    };
}
