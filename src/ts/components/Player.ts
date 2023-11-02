import { gsap } from 'gsap/dist/gsap';
import { browser, breakpoint } from '../Site';
import { Component } from './Component';
import { generateUID, parseToTime } from '../Utils';

export interface IPlayerSettings {
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
    controls?: boolean;

    id?: string | number;
    src?: string;
    src_mobile?: string;
    poster?: string;
    poster_mobile?: string;

    ratio?: number;
    ratio_mobile?: number;
    width?: number;
    height?: number;
    size?: PlayerSize;

    volume?: number;
    hotkeys?: boolean;
    ready_time?: number; // started class
    tracking?: Array<string>;
}

export interface IPlayerElements {
    duration?: HTMLElement;
    fullBtn?: HTMLElement;
    loaded?: HTMLElement;
    next?: HTMLElement;
    playBtn?: HTMLElement;
    playerBar?: HTMLElement;
    poster?: HTMLElement;
    prev?: HTMLElement;
    progress?: HTMLElement;
    scrubber?: HTMLElement;
    time?: HTMLElement;
    title?: HTMLElement;
    toggleBtn?: HTMLElement;
    volume?: HTMLElement;
    volumeBar?: HTMLElement;
    volumeButton?: HTMLElement;
    volumeValue?: HTMLElement;
    captions?: HTMLElement;
    cc?: HTMLElement;
}

export class PlayerEvents {
    public static END = 'end';
    public static NEXT = 'next';
    public static PREV = 'prev';
}

export class PlayerSize {
    public static COVER = 'cover';
    public static CONTAIN = 'contain';
    public static AUTO = 'auto';
}

declare const dataLayer;

export abstract class Player extends Component {
    public static instances: Array<Player> = [];

    // public playlist: Playlist;

    protected uid: string;
    protected mediaEl: HTMLElement;
    protected controls: IPlayerElements;
    protected isLoaded: boolean;
    protected scrubbing: boolean;
    protected volumeUpdating: boolean;
    protected settings: IPlayerSettings;
    protected isReady = false;

    private timeout;
    private wasPlaying: boolean;
    private videoHasBeenPlayed = false;

    constructor(protected view: HTMLElement) {
        super(view);

        // extend settings:
        this.settings = {
            autoplay: false,
            loop: false,
            muted: false,
            controls: false,
            volume: 1,
            width: 480,
            height: 270,
            size: PlayerSize.AUTO,
            ready_time: 0.001,
            ratio_mobile: null,
            hotkeys: true,
        };

        this.settings = Object.assign(this.settings, JSON.parse(this.view.getAttribute('options')));

        // generate unique id:
        this.uid = generateUID();

        // setup:
        this.setup();
        this.resize();

        // store the object in the DOM element
        // and in instances array:
        if (typeof Player.instances === 'undefined') {
            Player.instances = [];
        }
        Player.instances.push(this);

        this.view.classList.add('is-initialized');
    }

    // pause all instances of Player class:
    static pauseAll(uid?: string): void {
        Player.instances.forEach(item => {
            if (typeof uid === undefined || uid !== item.uid) {
                item.pause();
            }
        });
    }

    // pause all instances of Player class inside element:
    static pauseAllIn(selector: string): void {
        Player.instances.forEach(item => {
            if (item.view.closest(selector)) {
                item.pause();
            }
        });
    }

    public abstract play(): void;
    public abstract pause(): void;
    public abstract toggle(e?: Event): void;
    public abstract seek(value): void;
    public abstract toggleMute(): void;
    public abstract setVolume(value): void;
    public abstract createPlayer(): void;
    public abstract unload(): void;
    // tslint:disable: no-any
    public abstract load(data: IPlayerSettings): {} | Promise<any>;
    public abstract preload(): Promise<any>;
    // tslint:enable: no-any

    public hide(): void {
        this.view.style.display = 'none';
    }

    public show(): void {
        this.view.style.display = 'block';
    }

    public turnremoveEventListener(): void {
        if (!this.isPaused()) {
            this.wasPlaying = true;
            this.pause();
        } else {
            this.wasPlaying = false;
        }
    }

    public turnOn(): void {
        if (this.wasPlaying) {
            this.play();
        }
    }

    // @ts-ignore
    public animateIn(): void {
        if (!this.view) { return; }
        this.showPlayerBar();
    }

    public destroy(): void {
        gsap.killTweensOf(this.view);
        Player.instances.splice(Player.instances.indexOf(this), 1);
        window.clearTimeout(this.timeout);
        this.unbind();
        this.unload();
        this.view = null;

        super.destroy();
    }

    public resize = (): void => {
        if (
            !this.settings.ratio
            && this.settings.width
            && this.settings.height
        ) {
            this.settings.ratio = this.settings.width / this.settings.height;
        }

        const { size } = this.settings;
        const mediaRatio = breakpoint.phone && this.settings.ratio_mobile
            ? this.settings.ratio_mobile
            : this.settings.ratio;

        switch (size) {
            case PlayerSize.AUTO:
                // console.log({ mediaRatio });
                this.view.style.paddingTop = `${100 / mediaRatio}%`;
                this.view.classList.add('is-proportional');
                break;

            case PlayerSize.CONTAIN:
            case PlayerSize.COVER:
                const wrap = this.view.parentElement;
                const wrapWidth = wrap.clientWidth;
                const wrapHeight = wrap.clientHeight;
                const wrapRatio = wrapWidth / wrapHeight;

                let wdt: number;
                if (size === PlayerSize.CONTAIN) {
                    wdt = wrapRatio < mediaRatio
                        ? wrapWidth
                        : wrapHeight * mediaRatio;
                } else if (size === PlayerSize.COVER) {
                    wdt = wrapRatio < mediaRatio
                        ? wrapHeight * mediaRatio
                        : wrapWidth;
                }

                const hgt = wdt / mediaRatio;
                const marginLeft = Math.min(0, (wrapWidth - wdt) * 0.5);
                const marginTop = Math.min(0, (wrapHeight - hgt) * 0.5);
                // console.log(wdt, hgt);

                this.view.classList.remove('is-proportional');
                this.view.style.width = `${wdt}px`;
                this.view.style.height = `${hgt}px`;
                this.view.style.marginLeft = `${marginLeft}px`;
                this.view.style.marginTop = `${marginTop}px`;
                this.view.style.paddingTop = '';

                break;

            default:
                break;
        }
    };

    protected abstract isPaused(): boolean;
    protected abstract setup(): void;
    protected abstract bindPlayer(): void;
    protected abstract unbindPlayer(): void;

    protected toggleFullscreen(): void {
        if (screenfull.isEnabled) {
            screenfull.toggle(this.view);
        }
    }

    protected buildUI(): void {
        this.controls = {};
        this.controls.poster = this.view.querySelector('.player__poster');
        this.controls.title = this.view.querySelector('.player__title');
        this.controls.playerBar = this.view.querySelector('.player__bar');
        this.controls.toggleBtn = this.view.querySelector('.player__playpause');
        this.controls.playBtn = this.view.querySelector('.player__toggle');
        this.controls.fullBtn = this.view.querySelector('.player__full');
        this.controls.volume = this.view.querySelector('.player__volume');
        this.controls.volumeBar = this.view.querySelector('.volume__bar');
        this.controls.volumeValue = this.view.querySelector('.volume__value');
        this.controls.volumeButton = this.view.querySelector('.volume__button');
        this.controls.scrubber = this.view.querySelector('.player__scrubber');
        this.controls.duration = this.view.querySelector('.player__duration');
        this.controls.time = this.view.querySelector('.player__played');
        this.controls.loaded = this.view.querySelector('.player__loaded');
        this.controls.progress = this.view.querySelector('.player__progress');
        this.controls.prev = this.view.querySelector('.player__prev');
        this.controls.next = this.view.querySelector('.player__next');
        this.controls.captions = this.view.querySelector('.player__captions');
        this.controls.cc = this.view.querySelector('.player__cc');

        if (this.settings.autoplay) {
            this.view.classList.add('has-autoplay');
        }

        this.view.classList.add('has-controls');

        if (this.settings.muted) {
            this.setVolume(0);
        }

        // poster
        this.loadPoster();
    }

    protected bind(): void {

        if (this.controls) {
            this.controls.toggleBtn && this.controls.toggleBtn.addEventListener('click', this.onToggleClick);
            this.controls.playBtn && this.controls.playBtn.addEventListener('click', this.onToggleClick);
            this.controls.fullBtn && this.controls.fullBtn.addEventListener('click', this.onFullClick);
            this.controls.prev && this.controls.prev.addEventListener('click', this.onPrevClick);
            this.controls.next && this.controls.next.addEventListener('click', this.onNextClick);
            this.controls.volumeButton && this.controls.volumeButton.addEventListener('click', this.onVolumeButtonClick);
            this.controls.volumeBar && this.controls.volumeBar.addEventListener('mousedown', this.onVolumeDown);
            this.controls.volumeBar && this.controls.volumeBar.addEventListener('click', this.onVolumeClick);
            this.controls.scrubber && this.controls.scrubber.addEventListener('mousedown', this.onScrubberDown);
            this.controls.scrubber && this.controls.scrubber.addEventListener('click', this.onScrubberClick);
        }

        this.view.addEventListener('mousemove', this.onMouseMove);
        this.view.addEventListener('mouseup', this.onMouseUp);
        this.view.addEventListener('mouseleave', this.onMouseLeave);
        this.view.addEventListener('click', this.onClick);

        document.addEventListener('keydown', this.onKeyDown);

        this.bindPlayer();
    }

    protected unbind(): void {
        if (this.controls) {
            this.controls.toggleBtn && this.controls.toggleBtn.removeEventListener('click', this.onToggleClick);
            this.controls.playBtn && this.controls.playBtn.removeEventListener('click', this.onToggleClick);
            this.controls.scrubber && this.controls.scrubber.removeEventListener('mousedown', this.onScrubberDown);
            this.controls.scrubber && this.controls.scrubber.removeEventListener('click', this.onScrubberClick);
            this.controls.fullBtn && this.controls.fullBtn.removeEventListener('click', this.onFullClick);
            this.controls.volumeBar && this.controls.volumeBar.removeEventListener('mousedown', this.onVolumeDown);
            this.controls.volumeBar && this.controls.volumeBar.removeEventListener('click', this.onVolumeClick);
        }

        this.unbindPlayer();
    }

    protected onDurationChange(data?): void {}
    protected onProgress(data?): void {}
    protected onTimeupdate(data?): void {}

    protected onCanplay(): void {
        this.view.classList.add('is-canplay');
        this.view.classList.remove('is-error');
    }

    protected onPlay(): void {
        this.view.classList.add('is-played');
        this.view.classList.remove('is-ended,is-error');
        Player.pauseAll(this.uid);

        if (!this.videoHasBeenPlayed && dataLayer) {
            this.videoHasBeenPlayed = true;
            dataLayer.push({ event: 'video_play', value: 'how-gpw-works' });
        }
    }

    protected onPlaying(): void {
        this.view.classList.add('is-playing');
        this.view.classList.remove('is-loading,is-error');
    }

    protected onPause(): void {
        this.view.classList.remove('is-playing');
    }

    protected onWaiting(): void {
        this.view.classList.remove('is-playing');
        this.view.classList.add('is-loading');
    }

    protected onEnd(): void {
        this.view.classList.remove('is-playing,is-played,is-started');
        this.view.classList.add('is-ended');
    }

    protected onError(e): void {
        if (this.view && e.target.networkState && e.target.networkState === 3) {
            console.warn(
                `Can't load media ${(e.target as HTMLMediaElement).src}`,
            );
            this.view.classList.add('is-error');
        }
    }

    protected onFullClick = (e): void => {
        e.stopPropagation();
        this.toggleFullscreen();
    };

    protected onNextClick = (e): void => {
        e.preventDefault();
        e.stopPropagation();
    };

    protected onClick = (e): void => {
        if (
            e.target.closest('.player__bar')
        ) {
            e.preventDefault();
            e.stopPropagation();
            this.toggle();
        }


    };

    protected onKeyDown = (e: KeyboardEvent): void | boolean => {
        // if (
        //     !!this.settings.hotkeys &&
        //     (e.keyCode || e.which) === Utils.keys.space
        // ) {
        //     e.preventDefault();
        //     e.stopPropagation();
        //     this.toggle();
        //     return false;
        // }
    };

    protected onMouseUp = (e): void => {
        e.stopPropagation();
        e.preventDefault();
        if (this.scrubbing) {
            e.stopPropagation();
            const seek = (e.pageX - this.controls.scrubber.getBoundingClientRect().left)
                / this.controls.scrubber.clientWidth;
            this.seek(seek);
        }
        this.scrubbing = false;
        this.volumeUpdating = false;
        this.view.classList.remove('is-scrubbing');
    };

    protected onMouseLeave = (e): void => {
        this.scrubbing = false;
        this.volumeUpdating = false;
        this.view.classList.remove('is-scrubbing');
    };

    protected onMouseMove = (e): void => {
        e.stopPropagation();
        e.preventDefault();
        this.view.classList.add('is-mousemove');
        window.clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            this.hideBar();
        }, 2000);

        if (this.scrubbing) {
            e.stopPropagation();
            const posX = e.pageX - this.controls.scrubber.getBoundingClientRect().left;
            const width = this.controls.scrubber.clientWidth;
            const value = Math.max(0, Math.min(1, posX / width));
            this.controls.progress.style.width = `${value * 100}%`;
            this.seek(value);
        }

        if (this.volumeUpdating) {
            e.stopPropagation();
            const posX = e.pageX - this.controls.volumeBar.getBoundingClientRect().left;
            const width = this.controls.volumeBar.clientWidth;
            const value = Math.max(0, Math.min(1, posX / width));
            this.setVolume(value);
        }
    };

    protected onVolumeClick = (e): void => {
        e.stopPropagation();

        const offset = this.controls.volumeBar.getBoundingClientRect();
        const valuePos = e.clientX - offset.left;
        const value = valuePos / this.controls.volumeBar.clientWidth;

        this.setVolume(value);
    };

    protected onVolumeButtonClick = (e): void => {
        e.preventDefault();

        this.toggleMute();
    };

    protected onVolumeDown = (e): void => {
        e.stopPropagation();
        this.volumeUpdating = true;
    };

    protected onScrubberDown = (e): void => {
        e.stopPropagation();
        this.scrubbing = true;
        this.view.classList.add('is-scrubbing');
    };

    protected onScrubberClick = (e): void => {
        e.stopPropagation();
        const seek = (e.pageX - e.currentTarget.getBoundingClientRect().left)
            / e.currentTarget.clientWidth;
        this.seek(seek);
    };

    protected onToggleClick = (e): void => {
        e.preventDefault();
        e.stopPropagation();
        this.toggle();

    };

    protected onPrevClick = (e): void => {
        e.preventDefault();
        e.stopPropagation();
    };

    protected loadPoster(): void {
        if (this.settings.poster) {
            const poster = !!browser.mobile
                && this.settings.poster_mobile
                && this.settings.poster_mobile !== ''
                ? this.settings.poster_mobile
                : this.settings.poster;
            if (this.controls && this.controls.poster) {
                this.controls.poster.style.backgroundImage = `url(${poster})`;
            }
        }

        this.view.classList.toggle('has-poster', !!this.settings.poster);
    }

    protected resetTimeline(): void {
        if (this.controls) {
            this.controls.time.innerText = parseToTime(0);
            this.controls.progress.style.width = '0';
            this.controls.loaded.style.width = '0';
        }
    }

    protected updateTimeline(
        duration: number,
        buffered?: number,
        current?: number,
    ): void {
        if (!duration || !this.controls) {
            return;
        }

        if (this.controls.duration) {
            this.controls.duration.innerText = parseToTime(duration);
        }
        if (this.controls.time && current) {
            this.controls.time.innerText = parseToTime(current || 0);
        }
        if (buffered && this.controls.loaded) {
            this.controls.loaded.style.width = `${(Math.max(buffered, current || 0) / duration) * 100}%`;
        }
        if (current) {
            this.controls.progress.style.width = `${((current || 0) / duration) * 100}%`;
            this.view.classList.toggle(
                'is-started',
                current > this.settings.ready_time,
            );
        }
    }

    protected updateVolume(volume: number): void {
        this.view.classList.toggle('is-muted', volume < 0.1);
        if (this.controls && this.controls.volumeValue) {
            this.controls.volumeValue.style.width = `${volume * 100}%`;
        }
    }

    protected showPlayerBar(): void {
        if (!this.view) { return; }
        this.view.classList.add('show-playerbar');
        setTimeout(() => {
            if (!this.view) { return; }
            this.view.classList.remove('show-playerbar');
        }, 2500);
    }

    protected hideBar(): void {
        // if (!this.controls.playerBar.is(':hover')) {
        this.view.classList.remove('is-mousemove');
        // }
    }
}
