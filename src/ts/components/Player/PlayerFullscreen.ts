import { Handler } from '../../Handler';
import { browser } from '../../Site';

export class PlayerFullscreenEvents {
    public static EXIT: string = 'exit';
    public static ENTER: string = 'enter';
}

export interface ExtendedDocument extends Document {
    mozFullScreenElement: HTMLElement;
    webkitFullscreenElement: HTMLElement;
    msFullscreenElement: HTMLElement;
    exitFullscreen(): Promise<void>;
    mozCancelFullScreen(): Promise<void>;
    webkitExitFullscreen(): Promise<void>;
}

export const htmlDocument: ExtendedDocument = document as ExtendedDocument;



export class PlayerFullscreen extends Handler {



    private static getFullscreenElement(): HTMLElement | any {
        // eslint-disable-next-line max-len
        return htmlDocument.fullscreenElement || htmlDocument.mozFullScreenElement || htmlDocument.webkitFullscreenElement || htmlDocument.msFullscreenElement;
    }



    constructor(private btnEl: HTMLElement, private playerEl: HTMLElement) {
        super();

        this.btnEl = btnEl;
        this.playerEl = playerEl;

        this.bind();
    }



    public destroy(): void {
        this.unbind();
    }



    public isFullscreen(): boolean {
        return PlayerFullscreen.getFullscreenElement();
    }



    public toggle(): void {
        if (this.isFullscreen()) {
            this.exitFullscreen();
        } else {
            this.goFullscreen(this.playerEl);
        }
    }



    public exitFullscreen(): void {
        if (htmlDocument.exitFullscreen) {
            htmlDocument.exitFullscreen();
        } else if (htmlDocument.mozCancelFullScreen) {
            htmlDocument.mozCancelFullScreen();
        } else if (htmlDocument.webkitExitFullscreen) {
            htmlDocument.webkitExitFullscreen();
        }
    }



    public goFullscreen(element: HTMLElement | any): void {

        let promise;
        if (element.requestFullscreen) {
            promise = element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
            promise = element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            promise = element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            promise = element.msRequestFullscreen();
        }

        promise.then(() => {
            this.playerEl.classList.add('is-fullscreen');
        }).catch(err => {
            console.error(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
        });
    }



    private bind(): void {
        this.btnEl?.addEventListener('click', this.onBtnClick);
        document.addEventListener('fullscreenchange', this.onFullscreenChange);
        const mm = window.matchMedia('(orientation: landscape) and (max-height: 1023px)');
        mm.addEventListener('change', this.onOrientationChange);

        [...this.playerEl.querySelectorAll('video')].forEach(video => {
            video.addEventListener('webkitendfullscreen', this.onVideoFullscreenExit, false);
        });
    }



    private unbind(): void {
        this.btnEl?.removeEventListener('click', this.onBtnClick);
        document.removeEventListener('fullscreenchange', this.onFullscreenChange);
    }



    private onBtnClick = (e: MouseEvent): void => {
        e.preventDefault();
        e.stopPropagation();

        if (PlayerFullscreen.getFullscreenElement()) {
            this.exitFullscreen();
        } else if (browser.mobile || browser.ios) {
            const mediaElement = this.playerEl.querySelector('video.is-current') as any;
            this.trigger(PlayerFullscreenEvents.ENTER);
            mediaElement?.webkitEnterFullscreen && mediaElement?.webkitEnterFullscreen();
            mediaElement?.enterFullscreen && mediaElement?.enterFullscreen();
            this.playerEl.classList.add('is-fullscreen');
        } else {
            this.goFullscreen(this.playerEl);
        }
    };



    private onFullscreenChange = () => {
        if (PlayerFullscreen.getFullscreenElement()) { return; }
        this.playerEl.classList.remove('is-fullscreen');
        this.trigger(PlayerFullscreenEvents.EXIT);
    };



    private onVideoFullscreenExit = () => {
        this.playerEl.classList.remove('is-fullscreen');
        this.trigger(PlayerFullscreenEvents.EXIT);
    };



    private onOrientationChange = e => {
        // if (browser.mobile) {
        //     const mediaElement = this.playerEl.querySelector('video.is-current') as any;
        //     if (e.matches) {
        //         // landscape
        //         this.playerEl.classList.add('is-fullscreen');
        //         this.trigger(PlayerFullscreenEvents.ENTER);
        //         mediaElement?.webkitEnterFullscreen && mediaElement?.webkitEnterFullscreen();
        //         mediaElement?.enterFullscreen && mediaElement?.enterFullscreen();
        //     } else {
        //         // portrait
        //         mediaElement?.webkitExitFullscreen && mediaElement?.webkitExitFullscreen();
        //         mediaElement?.exitFullscreen && mediaElement?.exitFullscreen();
        //     }
        // }
    };
}
