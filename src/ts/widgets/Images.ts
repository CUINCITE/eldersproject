/// <reference path="../definitions/imagesloaded.d.ts" />


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
            imagesLoaded(imgElements).on('always', () => resolve());
        });

    }


    /**
     * listen to all images loaded event
     * mark them as loaded
     */
    public static bind(): void {
        imagesLoaded && imagesLoaded(document.body, Images.onLoaded);
    }


    /**
     * imagesLoaded successful callback
     */
    private static onLoaded = instance => {

        [...instance.images].forEach(({ img, isLoaded }) => {

            if (isLoaded) {
                img.classList.remove('is-loading');
                img.classList.add('is-loaded');
                img.closest('figure')?.classList.add('is-loaded');
                img.closest('.image')?.classList.add('is-loaded');
            }
        });
    };
}
