import { Player, IPlayerSettings } from './Player';
import { browser } from '../Site';

// eslint-disable-next-line no-shadow
export enum MediaState {
    HAVE_NOTHING,
    HAVE_METADATA,
    HAVE_CURRENT_DATA,
    HAVE_FUTURE_DATA,
    HAVE_ENOUGH_DATA,
}

export class Video extends Player {
    protected media: HTMLVideoElement | HTMLAudioElement;
    protected isAudio: boolean;
    private isShown = false;

    constructor(protected view: HTMLElement) {
        super(view);
    }



    public preload(): Promise<boolean> {
        const state = !browser.safari
            ? MediaState.HAVE_ENOUGH_DATA
            : MediaState.HAVE_METADATA;
        return new Promise<boolean>((resolve, reject) => {
            if (!!browser.mobile || !this.settings.autoplay) {
                resolve(true);
            } else if (this.media.readyState >= state) {
                resolve(true);
            } else {
                this.mediaEl.addEventListener('loadeddata', () => {
                    if (this.media.readyState >= state) {
                        resolve(true);
                    }
                });
            }
        });
    }



    public load(data: IPlayerSettings): Promise<number | {}> {
        return new Promise<boolean>((resolve, reject) => {
            let src = !!browser.mobile && data.src_mobile && data.src_mobile !== ''
                ? data.src_mobile
                : data.src;
            src = this.decodeURL(src);

            this.media.pause();
            this.media.src = src;
            this.view.classList.remove('is-ended,is-started,is-played,is-playing');
            this.media.load();

            this.resetTimeline();

            if (this.settings.autoplay && this.isShown) {
                this.play();
            }

            this.settings.ratio = data.ratio;
            // this.settings.ratio_mobile = data.ratio_mobile;
            this.resize();

            this.settings.poster = data.poster;
            this.settings.poster_mobile = data.poster_mobile;
            this.loadPoster();

            resolve(true);
        });
    }



    public animateIn(): void {
        this.isShown = true;
        if (this.settings.autoplay) {
            this.play();
        }
        super.animateIn();
    }



    public animateOut(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.pause();
            resolve();
        });
    }



    public play(): void {
        const playPromise = this.media.play();

        // show poster if autoplay fails:
        setTimeout(() => {
            this.view.classList.add('should-play');
        }, 1000);

        if (playPromise !== undefined) {
            // tslint:disable-next-line: no-any
            (playPromise as any)
                .then(() => {
                    this.view.classList.remove('autoplay-failed');
                })
                .catch(error => {
                    this.view.classList.add('autoplay-failed');
                });
        }
    }



    public pause(): void {
        this.media.pause();
    }



    public toggle(): void {
        if (!this.media.paused) {
            this.media.pause();
        } else {
            Player.pauseAll();
            this.media.play();
        }
    }



    public unload(): void {

        // unload video source:
        if (this.media.src) {
            this.media.pause();
            this.media.src = '';
            this.media.load();
        }
    }



    public seek(value): void {
        this.media.currentTime = this.media.duration * value;
    }



    public setVolume(value: number): void {
        this.media.volume = value;
        this.updateVolume(this.media.volume);
    }



    public toggleMute(): void {
        this.media.volume = this.media.volume > 0 ? 0 : 1;
        this.updateVolume(this.media.volume);
    }



    public createPlayer(): void {}



    protected isPaused(): boolean {
        return this.media.paused;
    }



    protected setup(): void {
        this.mediaEl = this.view.querySelector('audio, video');
        if (!this.mediaEl) {
            console.error(
                'Video/Audio component must contain html `<audio>` or `<video>` element',
            );
            return;
        }

        this.media = <HTMLVideoElement> this.mediaEl;
        this.isAudio = this.media.tagName === 'AUDIO';

        // make sure ratios are float numbers:
        this.settings.ratio = parseFloat(`${this.settings.ratio}`);
        // this.settings.ratio_mobile = <number>(
        //     parseFloat(this.settings.ratio_mobile + "")
        // );

        // get properties from html data
        // if (this.mediaEl.data("src-mobile")) {
        //     this.settings.src_mobile = this.mediaEl.data("src-mobile");
        // }
        // if (this.mediaEl.data("src")) {
        //     this.settings.src = this.mediaEl.data("src");
        // }

        // rmeove mobile ratio if no mobile src:
        if (!this.settings.src_mobile || this.settings.src_mobile === '') {
            // delete this.settings.ratio_mobile;
            delete this.settings.src_mobile;
        }

        // mobile src:
        if (
            !!browser.mobile
            && this.settings.src_mobile
            && this.settings.src_mobile !== this.media.src
        ) {
            this.media.src = this.decodeURL(this.settings.src_mobile);
            this.media.load();
        } else if (
            !browser.mobile
            && this.settings.src
            && this.settings.src !== this.media.src
        ) {
            this.media.src = this.decodeURL(this.settings.src);
            this.media.load();
        }

        // volume:
        if (this.settings.volume) {
            this.media.volume = this.settings.volume;
        }

        // autoplay:
        if (this.media.autoplay || this.settings.autoplay) {
            this.settings.autoplay = true;
            this.media.autoplay = false;
        }

        // loop:
        if (this.media.loop) {
            this.settings.loop = true;
        }
        if (this.settings.loop) {
            this.media.loop = true;
        }

        // poster:
        const media = <HTMLVideoElement> this.media;
        if (media.poster && !this.settings.poster) {
            this.settings.poster = media.poster;
            if (this.media.controls) {
                media.poster = '';
            }
        }

        // controls:
        if (!!this.media.controls || this.settings.controls) {
            this.buildUI();
            this.media.controls = false;
        }

        this.updateVolume(this.media.volume);
        this.bind();
        this.resize();

        if (this.settings.autoplay) {
            // because we need to fire `play()` after `animateIn()`
            this.pause();
        }
    }



    protected bind(): void {

        this.mediaEl.addEventListener('click', this.onToggleClick);
        super.bind();
    }



    protected bindPlayer(): void {
        if (this.media.readyState >= 2) {
            this.onLoaded();
        }

        this.mediaEl.addEventListener('loadeddata', () => this.onLoaded());
        this.mediaEl.addEventListener('loadedmetadata', () => this.onLoaded());
        this.mediaEl.addEventListener('durationchange', () => this.onDurationChange());
        this.mediaEl.addEventListener('updateMediaState', () => this.onDurationChange());
        this.mediaEl.addEventListener('progress', () => this.onProgress());
        this.mediaEl.addEventListener('updateMediaState', () => this.onProgress());
        this.mediaEl.addEventListener('timeupdate', () => this.onTimeupdate());
        this.mediaEl.addEventListener('play', () => this.onPlay());
        this.mediaEl.addEventListener('canplay', () => this.onCanplay());
        this.mediaEl.addEventListener('playing', () => this.onPlaying());
        this.mediaEl.addEventListener('pause', () => this.onPause());
        this.mediaEl.addEventListener('waiting', () => this.onWaiting());
        this.mediaEl.addEventListener('ended', () => this.onEnd());
        this.mediaEl.addEventListener('error', e => this.onError(e));

        // if (screenfull.isEnabled) {
        //     document.addEventListener(screenfull.raw.fullscreenchange, () => {
        //         this.view.toggleClass("is-fullscreen", screenfull.isFullscreen);
        //     });
        // }
    }



    protected unbindPlayer(): void {
        this.mediaEl.removeEventListener('loadeddata', () => this.onLoaded());
        this.mediaEl.removeEventListener('loadedmetadata', () => this.onLoaded());
        this.mediaEl.removeEventListener('durationchange', () => this.onDurationChange());
        this.mediaEl.removeEventListener('updateMediaState', () => this.onDurationChange());
        this.mediaEl.removeEventListener('progress', () => this.onProgress());
        this.mediaEl.removeEventListener('updateMediaState', () => this.onProgress());
        this.mediaEl.removeEventListener('timeupdate', () => this.onTimeupdate());
        this.mediaEl.removeEventListener('play', () => this.onPlay());
        this.mediaEl.removeEventListener('canplay', () => this.onCanplay());
        this.mediaEl.removeEventListener('playing', () => this.onPlaying());
        this.mediaEl.removeEventListener('pause', () => this.onPause());
        this.mediaEl.removeEventListener('waiting', () => this.onWaiting());
        this.mediaEl.removeEventListener('ended', () => this.onEnd());
        this.mediaEl.removeEventListener('error', e => this.onError(e));
    }



    protected onLoaded(): void {
        this.loadCaptions();
    }



    protected onDurationChange(): void {
        const { duration } = this.media;
        if (!duration) {
            return;
        }
        this.updateTimeline(null, null, duration);
    }



    protected onProgress(): void {
        this.updateLoadProgress();
    }



    protected onTimeupdate(): void {
        const current = this.media.currentTime;
        if (!current || this.scrubbing) {
            return;
        }
        this.updateTimeline(this.media.duration, null, current);
    }

    private loadCaptions(): void {
        if (this.media.textTracks.length > 0) {
            this.view.classList.add('has-cc');

            this.media.textTracks[0].mode = 'showing';

            const ccTracksData = [];
            for (let i = 0; i < this.media.textTracks.length; i++) {
                const track: TextTrack = this.media.textTracks[i];
                track.mode = 'hidden';
                ccTracksData.push({
                    lang: track.language,
                    label: track.label,
                    kind: track.kind,
                });
            }

            // setTimeout(() => {
            //     this.controls.cc.querySelector("li").on("click.cc", this.onCCTrackClick);
            // }, 0);
        } else {
            this.view.classList.remove('has-cc');
        }
    }

    private updateLoadProgress(): void {
        const { buffered } = this.media;
        const bufferedTime = buffered && buffered.length ? buffered.end(0) : 0;
        this.updateTimeline(this.media.duration, bufferedTime, null);
    }

    private decodeURL(src: string): string {
        const decode = (s): string => {
            try {
                const d = window.atob(s);
                return /^wq|x@$/g.test(d) ? d.replace(/^wq|x@$/g, '') : s;
            } catch (e) {
                return s;
            }
        };
        return /\.mp4$/.test(src) ? src : decode(src);
    }
}
