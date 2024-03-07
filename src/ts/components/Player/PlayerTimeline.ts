import { gsap } from 'gsap/dist/gsap';
import { Sounds } from '../../widgets/Sounds';
import { Handler } from '../../Handler';
import { browser } from '../../Site';

export class PlayerTimelineEvents {
    public static SEEK: string = 'seek';
}

export class PlayerTimeline extends Handler {

    private isScrubbing: boolean;
    private hoverEl: HTMLElement;
    private currentEl: HTMLElement;
    private loadedEl: HTMLElement;



    constructor(private view: HTMLElement, private playerEl: HTMLElement) {
        super();
        this.view = view;
        this.hoverEl = view.querySelector('.js-player-hover');
        this.currentEl = view.querySelector('.js-player-progress');
        this.loadedEl = view.querySelector('.js-player-loaded');

        this.bind();
    }



    public destroy(): void {
        this.unbind();
        this.hoverEl = null;
        this.currentEl = null;
        this.loadedEl = null;
    }



    public reset(): void {
        this.currentEl.style.width = '0';
        this.loadedEl.style.width = '0';
    }



    public update(metadata: { duration: number, buffered?: number, current?: number }, quick?: boolean): void {

        const { duration, buffered, current } = metadata;

        if (!duration) { return; }

        if (buffered && this.loadedEl) {
            gsap.to(this.loadedEl, {
                width: `${(Math.max(buffered, current || 0) / duration) * 100}%`,
                duration: !quick ? 0.3 : 0,
            });
        }

        if (typeof current === 'number') {
            gsap.to(this.currentEl, {
                width: `${((current || 0) / duration) * 100}%`,
                duration: !quick ? 0.3 : 0,
                ease: 'none',
            });
        }
    }



    public addHotspots(data, duration): void {

        data.related?.forEach(({ timeStart, color }) => {
            const hotspot = document.createElement('div');

            hotspot.classList.add('player__hotspot');
            hotspot.style.left = `${((timeStart || 0) / duration) * 100}%`;
            hotspot.style.backgroundColor = color;

            this.view.appendChild(hotspot);
        });

    }



    protected onMouseDown = (e: MouseEvent): void => {
        e.stopPropagation();
        this.isScrubbing = true;
    };



    protected onMouseMove = (e: MouseEvent): void => {

        const { seek } = this.getPosition(e);
        if (this.hoverEl) this.hoverEl.style.width = `${seek * 100}%`;

        if (this.isScrubbing) {
            e.stopPropagation();
            this.trigger(PlayerTimelineEvents.SEEK, seek, true);
            gsap.killTweensOf(this.currentEl);
            gsap.set(this.currentEl, { width: `${seek * 100}%` });
            this.playerEl.classList.add('is-scrubbing');
        }
    };



    protected onMouseUp = (e: MouseEvent): void => {
        if (this.isScrubbing) {
            e.stopPropagation();
            const { seek } = this.getPosition(e);
            this.trigger(PlayerTimelineEvents.SEEK, seek);
            Sounds.play('playerRewinding');
        }
        this.isScrubbing = false;
        this.playerEl.classList.remove('is-scrubbing');
    };



    protected onMouseLeave = (): void => {
        this.isScrubbing = false;
        this.playerEl.classList.remove('is-scrubbing');
    };



    protected onClick = (e: MouseEvent): void => {
        e.stopPropagation();
        const { seek } = this.getPosition(e);
        this.trigger(PlayerTimelineEvents.SEEK, seek);
        Sounds.play('playerRewinding');
        gsap.killTweensOf(this.currentEl);
        gsap.set(this.currentEl, { width: `${seek * 100}%` });
    };



    private bind(): void {
        !browser.touch && this.playerEl?.addEventListener('mouseup', this.onMouseUp);
        !browser.touch && this.playerEl?.addEventListener('mouseleave', this.onMouseLeave);
        !browser.touch && this.playerEl?.addEventListener('mousemove', this.onMouseMove);
        browser.touch && this.playerEl?.addEventListener('touchmove', this.onMouseMove);
        browser.touch && this.playerEl?.addEventListener('touchend', this.onMouseUp);

        !browser.touch && this.view?.addEventListener('click', this.onClick);
        !browser.touch && this.view?.addEventListener('mousedown', this.onMouseDown);
        browser.touch && this.view?.addEventListener('touchstart', this.onMouseDown);
    }



    private unbind(): void {
        this.playerEl?.removeEventListener('mouseup', this.onMouseUp);
        this.playerEl?.removeEventListener('mouseleave', this.onMouseLeave);
        this.playerEl?.removeEventListener('mousemove', this.onMouseMove);
        this.playerEl?.removeEventListener('touchmove', this.onMouseMove);
        this.playerEl?.removeEventListener('touchend', this.onMouseUp);

        this.view?.removeEventListener('mousedown', this.onMouseDown);
        this.view?.removeEventListener('touchstart', this.onMouseDown);
        this.view?.removeEventListener('click', this.onClick);
    }



    private getPosition(e: TouchEvent|MouseEvent): { x: number; width: number; seek: number } {
        const pageX = (e as MouseEvent).pageX || (e as TouchEvent).touches[0]?.pageX || (e as TouchEvent).changedTouches[0]?.pageX;
        const x = pageX - this.view.getBoundingClientRect().left;
        const width = this.view.clientWidth;
        const seek = Math.max(0, Math.min(1, x / width));
        return { x, width, seek };
    }
}
