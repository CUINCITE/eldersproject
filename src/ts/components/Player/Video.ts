import { decodeURL } from '../../components/Player/Player.utils';
import { IPlayerSettings, PlayerEvents } from '../../components/Player/Player.types';
import { MediaState, PlayerStorage } from '../../components/Player/Video.types';
import { browser } from '../../Site';
import { Player } from '../../components/Player/Player';
import { getStorageItem, normalizeUrl, setStorageItem } from '../../Utils';
import { VideoCaptions } from './VideoCaptions';
import { PlayerSettings } from './PlayerSettings';



export class Video extends Player {

    protected media: HTMLVideoElement | HTMLAudioElement;
    protected isAudio: boolean;

    public preload(): Promise<boolean> {
        const state = !browser.safari
            ? MediaState.HAVE_ENOUGH_DATA
            : MediaState.HAVE_METADATA;
        return new Promise<boolean>(resolve => {
            if (!!browser.mobile || !this.settings.autoplay) {
                resolve(true);
            } else if (this.media.readyState >= state) {
                resolve(true);
            } else {
                this.media.addEventListener('loadeddata', () => {
                    if (this.media.readyState >= state) {
                        resolve(true);
                    }
                });
            }
        });
    }



    public destroy(): void {
        this.cacheTimePosition(true);
        this.media.pause();
        this.media.src = '';
        this.media.load();
        super.destroy();
    }



    public load(data: IPlayerSettings): Promise<number|{}> {
        const src = !!browser.mobile && data.srcMobile && data.srcMobile !== '' ? data.srcMobile : data.src;

        this.media.pause();
        this.media.src = decodeURL(src);
        this.media.load();

        this.view.classList.remove('is-ended', 'is-started', 'is-played', 'is-playing');

        this.ui && this.ui.timeline?.reset();

        this.settings.autoplay && this.play();

        this.settings.ratio = data.ratio;
        this.settings.ratioMobile = data.ratioMobile;
        this.resize();

        this.settings.poster = data.poster;
        this.settings.posterMobile = data.posterMobile;

        this.ui.poster.load(data);

        this.settings.cacheTime && this.seekToCached();

        return Promise.resolve(true);
    }



    public play(): void {
        if (this.media && this.media.paused) {

            if (this.getCurrentTime() >= this.getDuration()) {
                this.ui?.timeline?.update({ current: 0, duration: this.getDuration() }, true);
                this.seek(0);
            }

            const playPromise = this.media.play();

            if (playPromise !== undefined) {
                (playPromise).then(() => {
                    this.view.classList.remove('autoplay-failed');
                }).catch(() => {
                    this.view.classList.add('autoplay-failed');
                });
            }

            // show poster if autoplay fails:
            setTimeout(() => {
                this.view.classList.add('should-play');
            }, 1000);
        }
    }



    public pause(): void {
        if (!this.media || this.media.paused) { return; }
        this.media.pause();
    }



    public toggle(play?: boolean): boolean {
        const playing: boolean = !this.media.paused;

        if (typeof play !== 'undefined') {
            if (!!play && !playing) {
                this.play();
            } else if (!play && !!playing) {
                this.pause();
            }
        } else {
            playing ? this.pause() : this.play();
        }

        return !playing;
    }



    public unload(): void {
        if (this.media) {
            this.media.pause();
            this.media.src = '';
            this.media.load();
        }
    }



    public seek(value: number): void {
        if (!this.getDuration()) { return; }
        this.media.currentTime = this.getStart() + this.getDuration() * value;
    }



    public seekToTime(time: number): void {
        this.media.currentTime = this.getStart() + time;
    }



    public skipForward(more?: boolean): void {
        this.seekToTime(this.getCurrentTime() + (more ? 10 : 5));
    }



    public skipBackward(more?: boolean): void {
        this.seekToTime(this.getCurrentTime() - (more ? 10 : 5));
    }



    public goRewind(): void {
        this.view.classList.add('is-rewinding');

        setTimeout(() => {
            this.view.classList.remove('is-rewinding');
        }, 1000);

        this.media.currentTime -= 15;
    }



    public goForward(): void {
        this.view.classList.add('is-rewinding');

        setTimeout(() => {
            this.view.classList.remove('is-rewinding');
        }, 1000);
        this.media.currentTime += 15;
    }



    public end(): void {
        this.seek(1);
        this.pause();
    }



    public restart(): void {
        this.seek(0);
        this.play();
    }



    public setVolume(value: number): void {
        this.media.volume = value;
        this.media.muted = value === 0;
        super.setVolume(value);
    }



    public toggleMute(mute?: boolean): void {
        if (typeof mute !== 'undefined') {
            this.media.muted = mute;
        } else {
            this.media.muted = !this.media.muted;
        }
        !this.media.muted && this.media.volume < 0.05 && (this.media.volume = 1);
        this.ui.volume.update(this.media.volume);
        this.ui.volume.toggle(this.media.muted);
    }



    public volumeUp(): void {
        if (this.media.muted) {
            this.toggleMute(false);
            this.setVolume(0.05);
        } else {
            this.setVolume(Math.min(1, this.media.volume + 0.05));
        }
    }



    public volumeDown(): void {
        this.setVolume(Math.max(0, this.media.volume - 0.05));
    }



    public setSpeed(speed: number): void {
        const constrainedSpeed = PlayerSettings.constrainSpeed(speed);
        this.media.playbackRate = constrainedSpeed;
        super.setSpeed(constrainedSpeed);
    }



    public speedUp(): void {
        this.setSpeed(this.media.playbackRate + PlayerSettings.SPEED_STEP);
    }



    public speedDown(): void {
        this.setSpeed(this.media.playbackRate - PlayerSettings.SPEED_STEP);
    }



    public setHotspots(data): void {
        this.ui.timeline.addHotspots(data, this.getDuration());
        this.ui.popups.loadData(data);
    }



    protected isPaused(): boolean {
        return this.media.paused;
    }



    protected setup(): void {

        this.createPlayer();

        // make sure ratios are float numbers:
        this.settings.ratio = parseFloat(`${this.settings.ratio}`);
        this.settings.ratioMobile = <number>parseFloat(`${this.settings.ratioMobile}`);


        // remove mobile ratio if no mobile src:
        if (!this.settings.srcMobile || this.settings.srcMobile === '') {
            delete this.settings.ratioMobile;
            delete this.settings.srcMobile;
        }

        // mobile src:
        if (!!browser.mobile && this.settings.srcMobile && this.settings.srcMobile !== this.media.src) {
            this.media.src = decodeURL(this.settings.srcMobile);
            this.media.load();
        } else if (!browser.mobile && this.settings.src && this.settings.src !== this.media.src) {
            this.media.src = decodeURL(this.settings.src);
            this.media.load();
        }

        // volume:
        this.settings.volume && (this.media.volume = this.settings.volume);
        this.settings.muted = this.media.muted;

        // autoplay:
        // if (this.media.autoplay || this.settings.autoplay) {
        //     this.settings.autoplay = true;
        //     this.media.autoplay = false;
        // }

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
            this.media.removeAttribute('controls');
        }

        this.bind();

        // seek to param or to local storage:
        !this.seekToParams() && this.settings.cacheTime && this.seekToCached();

        // set cached volume:
        const cachedVolume = getStorageItem(PlayerStorage.VOLUME);
        this.ui && this.ui.volume?.toggle(this.settings.muted);
        this.setVolume(parseFloat(cachedVolume) || this.media.volume);

        // set playback rate:
        const cachedSpeed = getStorageItem(PlayerStorage.SPEED);
        this.setSpeed(parseFloat(cachedSpeed) || 1);
    }



    protected createPlayer(): void {
        this.media = this.view.querySelector('audio, video');
        if (!this.media) {
            console.error('Video/Audio component must contain html `<audio>` or `<video>` element');
            return;
        }

        this.isAudio = this.media.tagName === 'AUDIO';
    }



    protected buildUI(): void {
        super.buildUI();
        this.loadCaptions();
    }



    protected loadCaptions(): void {
        const captionsEl = this.view.querySelector('.js-player-cc') as HTMLElement;
        captionsEl && this.ui && (this.ui.captions = new VideoCaptions(captionsEl, this.view));
    }



    protected bindPlayer(): void {
        this.media.addEventListener('loadeddata', () => this.onLoaded());
        this.media.addEventListener('loadedmetadata', () => this.onLoaded());
        this.media.addEventListener('durationchange', () => this.onDurationChange());
        this.media.addEventListener('updateMediaState', () => this.onDurationChange());
        this.media.addEventListener('progress', () => this.onProgress());
        this.media.addEventListener('updateMediaState', () => this.onProgress());
        this.media.addEventListener('timeupdate', () => this.onTimeupdate());
        this.media.addEventListener('play', () => this.onPlay());
        this.media.addEventListener('canplay', () => this.onCanplay());
        this.media.addEventListener('playing', () => this.onPlaying());
        this.media.addEventListener('pause', () => this.onPause());
        this.media.addEventListener('waiting', () => this.onWaiting());
        this.media.addEventListener('ended', () => this.onEnd());
        this.media.addEventListener('error', e => this.onError(e));

        if (this.media.readyState >= MediaState.HAVE_CURRENT_DATA) {
            this.onLoaded();
        }
    }



    protected unbindPlayer(): void {
        this.media.removeEventListener('loadeddata', () => this.onLoaded());
        this.media.removeEventListener('loadedmetadata', () => this.onLoaded());
        this.media.removeEventListener('durationchange', () => this.onDurationChange());
        this.media.removeEventListener('updateMediaState', () => this.onDurationChange());
        this.media.removeEventListener('progress', () => this.onProgress());
        this.media.removeEventListener('updateMediaState', () => this.onProgress());
        this.media.removeEventListener('timeupdate', () => this.onTimeupdate());
        this.media.removeEventListener('play', () => this.onPlay());
        this.media.removeEventListener('canplay', () => this.onCanplay());
        this.media.removeEventListener('playing', () => this.onPlaying());
        this.media.removeEventListener('pause', () => this.onPause());
        this.media.removeEventListener('waiting', () => this.onWaiting());
        this.media.removeEventListener('ended', () => this.onEnd());
        this.media.removeEventListener('error', e => this.onError(e));
    }



    protected onLoaded(): void {
        this.ui && this.ui.captions?.load(this.media);
        this.updateTime();
    }


    protected onDurationChange(): void {
        this.updateTime();
    }


    protected onProgress(): void {
        this.updateTime();
    }


    protected onTimeupdate(): void {
        this.constrainTime();
        this.updateTime();
    }



    protected onError(e): void {
        if (this.view && e.target.networkState && e.target.networkState === 3) {
            console.warn(`Can't load media ${(e.target as HTMLMediaElement).src}`);
            this.view.classList.add('is-error');
        }
    }


    protected onBeforeunload() {
        this.cacheTimePosition(true);
    }



    protected updateTime(): void {

        if (!this.media) { return; }

        const current = this.getCurrentTime();
        const duration = this.getDuration();
        const { buffered } = this.media;
        const bufferedTime = buffered && buffered.length ? buffered.end(0) : 0;

        this.ui.time.update({ duration, current }, this.settings.timeFormatLong);
        this.ui.timeline.update({ duration, buffered: bufferedTime, current });
        this.ui.popups.check(current);

        this.view.classList.toggle('is-started', current > this.settings.readyTime);

        this.cacheTimePosition();
        this.trigger(PlayerEvents.TIME_UPDATE, current);
    }



    protected seekToParams(): boolean {
        const time = (new URLSearchParams(window.location.search)).get('time');
        if (time) {
            this.seekToTime(parseInt(time, 10));
            return true;
        }
        return false;
    }



    protected seekToCached(): void {
        const path = normalizeUrl(window.location.pathname);
        const cachedTime = getStorageItem(PlayerStorage.SEEK + path);
        cachedTime && this.seekToTime(parseFloat(cachedTime));
    }



    protected cacheTimePosition(force?: boolean): void {
        const path = normalizeUrl(window.location.pathname);
        const time = this.getCurrentTime() >= this.getDuration() - 1 ? 0 : this.getCurrentTime();
        (!browser.ios || force) && setStorageItem(PlayerStorage.SEEK + path, `${time}`);
    }



    protected getDuration(): number {
        return this.settings.duration || this.media.duration;
    }


    protected getStart(): number {
        return this.settings.timeFrom || 0;
    }


    protected getCurrentTime(): number {
        return this.media.currentTime - this.getStart();
    }


    protected constrainTime(): void {

        if (!this.media) { return; }

        if (this.media.currentTime < this.getStart()) {
            this.media.currentTime = this.getStart();
            this.pause();
        }

        if (this.media.currentTime === this.getStart() + this.getDuration()) {
            this.pause();
            this.onEnd();
            return;
        }

        if (this.media.currentTime > this.getStart() + this.getDuration()) {
            this.media.currentTime = this.getStart() + this.getDuration();
        }
    }
}
