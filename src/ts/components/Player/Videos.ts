import { Video } from '../../components/Player/Video';
import { MediaState } from './Video.types';
import { PlayerEvents } from './Player.types';
import { VideosCaptions } from './VideosCaptions';
import { PlayerSettings } from './PlayerSettings';

export class Videos extends Video {

    private medias: HTMLVideoElement[] | HTMLMediaElement[];
    private mediasData: {
        duration: number;
        el: HTMLMediaElement;
        end: number;
        index: number;
        start: number;
    }[];

    private totalDuration: number;



    public destroy(): void {
        super.destroy();
        this.medias = null;
        this.mediasData = null;
        this.totalDuration = null;
    }



    public seek(value: number): void {
        const time = value * this.getDuration();
        this.seekToTime(time);
    }



    public seekToTime(time: number): void {
        if (!this.getDuration() || !this.mediasData) { return; }
        const t = Math.max(0, Math.min(this.getDuration(), time));
        const media = this.mediasData.find(item => item.start <= t && t <= item.end) || this.mediasData[0];
        const currentTime = t - (media?.start || 0);
        this.setMedia(media.el, currentTime, !this.isPaused());
    }



    public setVolume(value: number): void {
        this.medias.forEach(media => {
            media.volume = value;
            media.muted = value === 0;
        });
        super.setVolume(value);
    }



    public setSpeed(speed: number): void {
        const constrainedSpeed = PlayerSettings.constrainSpeed(speed);
        this.medias.forEach(media => { media.playbackRate = constrainedSpeed; });
        super.setSpeed(constrainedSpeed);
    }



    public toggleMute(mute?: boolean): void {
        super.toggleMute(mute);
        this.medias.forEach(media => { media.muted = this.media.muted; });
    }



    public setHotspots(data): void {
        this.ui?.timeline?.addHotspots(data, this.getDuration());
        this.ui?.popups?.loadData(data);
    }



    protected setup(): void {
        super.setup();

        this.medias.forEach(media => {
            media.controls = false;
            media.removeAttribute('controls');
            media.loop = false;
            (media as HTMLVideoElement).poster = '';
        });

        this.storeDurationData();
        !this.seekToParams() && this.settings.cacheTime && this.seekToCached();
    }



    protected createPlayer(): void {
        this.medias = [...this.view.querySelectorAll('video, audio')] as HTMLMediaElement[];

        if (!this.medias.length) {
            console.error('Video/Audio component must contain html `<audio>` or `<video>` element');
            return;
        }

        this.media = this.medias[0] as HTMLMediaElement;

        this.media.tagName === 'AUDIO' && this.view.classList.add('is-audio');
    }



    protected seekToParams(): boolean {

        if (!this.mediasData) { return false; }

        const session = (new URLSearchParams(window.location.search)).get('session');
        const time = (new URLSearchParams(window.location.search)).get('time');

        if (session) {
            this.seekToTime(this.mediasData[parseInt(session, 10) - 1].start + parseInt(time || '0', 10));
            return true;
        }

        if (time) {
            this.seekToTime(parseInt(time, 10));
            return true;
        }

        return false;
    }



    protected loadCaptions(): void {
        const captionsEl = this.view.querySelector('.js-player-cc') as HTMLElement;
        captionsEl && this.ui && (this.ui.captions = new VideosCaptions(captionsEl, this.view, this.medias));
    }



    protected bindPlayer(): void {
        this.medias.forEach(media => {
            media.addEventListener('loadeddata', () => this.onLoaded());
            media.addEventListener('loadedmetadata', () => this.onLoaded());
            media.addEventListener('durationchange', () => this.onDurationChange());
            media.addEventListener('updateMediaState', () => this.onDurationChange());
            media.addEventListener('progress', () => this.onProgress());
            media.addEventListener('updateMediaState', () => this.onProgress());
            media.addEventListener('timeupdate', () => this.onTimeupdate());
            media.addEventListener('play', () => this.onPlay());
            media.addEventListener('canplay', () => this.onCanplay());
            media.addEventListener('playing', () => this.onPlaying());
            media.addEventListener('pause', () => this.onPause());
            media.addEventListener('waiting', () => this.onWaiting());
            media.addEventListener('ended', () => this.onEnd());
            media.addEventListener('error', e => this.onError(e));
        });

        if (this.media.readyState >= MediaState.HAVE_CURRENT_DATA) {
            this.onLoaded();
        }
    }



    protected unbindPlayer(): void {
        this.medias.forEach(media => {
            media.removeEventListener('loadeddata', () => this.onLoaded());
            media.removeEventListener('loadedmetadata', () => this.onLoaded());
            media.removeEventListener('durationchange', () => this.onDurationChange());
            media.removeEventListener('updateMediaState', () => this.onDurationChange());
            media.removeEventListener('progress', () => this.onProgress());
            media.removeEventListener('updateMediaState', () => this.onProgress());
            media.removeEventListener('timeupdate', () => this.onTimeupdate());
            media.removeEventListener('play', () => this.onPlay());
            media.removeEventListener('canplay', () => this.onCanplay());
            media.removeEventListener('playing', () => this.onPlaying());
            media.removeEventListener('pause', () => this.onPause());
            media.removeEventListener('waiting', () => this.onWaiting());
            media.removeEventListener('ended', () => this.onEnd());
            media.removeEventListener('error', e => this.onError(e));
        });
    }



    protected onLoaded(): void {
        this.ui && this.ui.captions?.load(this.medias);
        this.updateTime();
    }



    protected onEnd(): void {
        const index = this.getMediaIndex(this.media);
        const next = this.medias[index + 1];
        if (!next) {
            // this.setMedia(this.medias[0], 0, false);
            super.onEnd();
        } else {
            this.setMedia(next, 0, true);
        }
    }



    protected updateTime(): void {
        if (!this.media || !this.mediasData) { return; }

        const current = this.getCurrentTime();
        const duration = this.getDuration();

        const isLong = JSON.parse(this.view.dataset.options).timeFormatLong as any;

        this.ui?.time?.update({ duration, current }, isLong);
        this.ui?.timeline?.update({ duration, buffered: 0, current });
        this.ui?.popups?.check(current);


        this.view.classList.toggle('is-started', current > this.settings.readyTime);

        !this.isPaused() && this.cacheTimePosition();
        this.trigger(PlayerEvents.TIME_UPDATE, current);
    }



    protected getDuration(): number {
        return this.settings.duration || this.totalDuration;
    }



    protected getCurrentTime(): number {
        const index = this.getMediaIndex(this.media);
        const mediaData = this.mediasData[index];
        const currentTime = mediaData.start + this.media.currentTime;
        return currentTime - this.getStart();
    }



    private setMedia(media: HTMLMediaElement, time: number, toPlay?: boolean): void {
        this.media.classList.remove('is-current');
        this.media !== media && this.media.pause();
        this.media = media;
        this.media.classList.add('is-current');
        this.media.currentTime = this.getStart() + time;
        toPlay && this.media.play();
    }



    private getMediaIndex(media: HTMLMediaElement): number {
        return [...media.parentElement.children].indexOf(media);
    }



    private storeDurationData(): void {
        let offset = 0;
        this.mediasData = this.medias.map((el, index) => {
            const duration = parseFloat(el.dataset.duration);
            const data = {
                el,
                duration,
                start: offset + (index ? 0.01 : 0), // additional one+ frame to not overlap
                end: offset + duration,
                index,
            };
            offset += duration;
            return data;
        });

        this.totalDuration = offset;
    }
}
