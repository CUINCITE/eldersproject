import { gsap } from 'gsap/dist/gsap';
import { Handler } from '../../Handler';
import { easing } from '../../Site';

export class PlayerVolumeEvents {
    public static CHANGE: string = 'change';
    public static MUTE: string = 'mute';
    public static UNMUTE: string = 'unmute';
}


export class PlayerVolume extends Handler {

    private isScrubbing: boolean;
    private isMuted: boolean;
    private isInitialSetup: boolean = true;
    private volume: number;
    private buttonEl: HTMLElement;
    private barEl: HTMLElement;
    private valueEl: HTMLElement;
    private timeout: ReturnType<typeof setTimeout>;



    constructor(private view: HTMLElement, private playerEl: HTMLElement) {
        super();
        this.view = view;
        this.playerEl = playerEl;
        this.buttonEl = this.view.querySelector('.js-volume-btn');
        this.barEl = this.view.querySelector('.js-volume-bar');
        this.valueEl = this.view.querySelector('.js-volume-value');
        this.bind();
    }



    public update(volume: number): void {
        this.volume = volume;
        this.valueEl && gsap.to(this.valueEl, {
            scaleY: volume,
            duration: this.isScrubbing ? 0.0001 : 0.2,
            ease: easing,
        });
        if (!this.isInitialSetup) {
            this.view.classList.add('is-updating');
            clearTimeout(this.timeout);
            this.timeout = setTimeout(() => this.view.classList.remove('is-updating'), (600 + 300));
        }
        this.isInitialSetup = false;
    }



    public toggle(muted: boolean): void {
        this.isMuted = muted;
        this.playerEl.classList.toggle('is-muted', this.isMuted);
        this.valueEl && gsap.to(this.valueEl, { scaleY: this.isMuted ? 0 : this.volume, duration: 0.2, ease: easing });
    }



    public destroy(): void {
        this.unbind();
        this.view = null;
        this.playerEl = null;
        this.buttonEl = null;
        this.barEl = null;
        this.valueEl = null;
    }



    private bind(): void {
        this.buttonEl?.addEventListener('click', this.onVolumeButtonClick);
        this.barEl?.addEventListener('click', this.onVolumeBarClick);
        this.barEl?.addEventListener('mousedown', this.onMouseDown);
        this.playerEl?.addEventListener('mousemove', this.onMouseMove);
        this.playerEl?.addEventListener('mouseup', this.onMouseUp);
        this.playerEl?.addEventListener('mouseleave', this.onMouseLeave);
    }



    private unbind(): void {
        this.buttonEl?.removeEventListener('click', this.onVolumeButtonClick);
        this.barEl?.removeEventListener('click', this.onVolumeBarClick);
        this.barEl?.removeEventListener('mousedown', this.onMouseDown);
        this.playerEl?.removeEventListener('mousemove', this.onMouseMove);
        this.playerEl?.removeEventListener('mouseup', this.onMouseUp);
        this.playerEl?.removeEventListener('mouseleave', this.onMouseLeave);
    }



    private onVolumeButtonClick = (e: MouseEvent): void => {
        e.preventDefault();
        e.stopPropagation();
        this.trigger(this.isMuted ? PlayerVolumeEvents.UNMUTE : PlayerVolumeEvents.MUTE);
    };



    private onVolumeBarClick = (e: MouseEvent): void => {
        e.stopPropagation();
        const value = Math.max(0, Math.min(1, 1 - e.offsetY / this.barEl.clientHeight));
        this.trigger(PlayerVolumeEvents.CHANGE, value);
    };



    private onMouseDown = (e: MouseEvent): void => {
        e.stopPropagation();
        this.isScrubbing = true;
    };



    private onMouseMove = (e): void => {
        if (this.isScrubbing) {
            e.stopPropagation();
            const posY = e.clientY - this.barEl.getBoundingClientRect().top;
            const value = Math.max(0, Math.min(1, 1 - posY / this.barEl.clientHeight));
            this.trigger(PlayerVolumeEvents.CHANGE, value);
        }
    };



    private onMouseUp = (): void => {
        this.isScrubbing = false;
    };



    private onMouseLeave = (): void => {
        this.isScrubbing = false;
    };

}
