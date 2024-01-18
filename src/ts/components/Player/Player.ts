import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

import { Component } from '../Component';
import * as Utils from '../../Utils';
import { IPlayerSettings, PlayerEvents, PlayerSize } from './Player.types';
import { PlayerTimeline, PlayerTimelineEvents } from './PlayerTimeline';
import { PlayerPopups } from './PlayerPopups';
import { PlayerTime } from './Player.Time';
import { PlayerPoster } from './PlayerPoster';
import { PlayerVolume, PlayerVolumeEvents } from './PlayerVolume';
import { PlayerFullscreen, PlayerFullscreenEvents } from './PlayerFullscreen';
import { VideoCaptions } from './VideoCaptions';
import { PlayerStorage } from './Video.types';
import { PlayerSettings, PlayerSettingsEvents } from './PlayerSettings';
import { Templates, TemplateNames } from '../../templates/Templates';
import { PushStates } from '../../PushStates';



export abstract class Player extends Component {


    // eslint-disable-next-line no-use-before-define
    public static instances: { [key: string]: Player } = {};


    // pause all instances of Player class:
    static pauseAll(omitUID?: string): void {
        // eslint-disable-next-line no-restricted-syntax
        for (const uid in Player.instances) {
            if (typeof omitUID === 'undefined' || omitUID !== uid) {
                Player.instances[uid].pause();
            }
        }
    }


    // pause all instances of Player class inside element:
    static pauseAllIn(el: HTMLElement): void {
        // eslint-disable-next-line no-restricted-syntax, guard-for-in
        for (const uid in Player.instances) {
            const item = Player.instances[uid];
            if (el.contains(item.view)) {
                item.pause();
            }
        }
    }


    public userPaused = false;

    protected uid: string;
    protected media: HTMLElement;
    protected isLoaded: boolean;
    protected isReady = false;
    protected settings: IPlayerSettings;
    protected wasPaused = false;
    protected st: ScrollTrigger;

    protected ui: {
        poster?: PlayerPoster;
        time?: PlayerTime;
        timeline?: PlayerTimeline;
        popups?: PlayerPopups;
        volume?: PlayerVolume;
        settings?: PlayerSettings;
        captions?: VideoCaptions;
        fullscreen?: PlayerFullscreen;
        toggleBtn?: HTMLElement,
        playPauseBtn?: HTMLElement,
        bottomPanel?: HTMLElement,
        thumbnail?: HTMLElement;
        minimize?: HTMLElement;
        playerBar?: HTMLElement;
        rewindBtn?: HTMLElement;
        forwardBtn?: HTMLElement;
    };



    constructor(protected view: HTMLElement, options?: Object) {
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
            readyTime: 0.001,
            hotkeys: false,
            pauseOnScroll: false,
            ...JSON.parse(view.dataset.options || '{}'),
            ...options,
        };

        // generate unique id:
        this.uid = Utils.generateUID();

        // setup:
        this.setup();
        this.resize();

        if (typeof Player.instances === 'undefined') { Player.instances = {}; }
        Player.instances[this.uid] = this;

        this.view.classList.add('is-initialized');
    }


    /* eslint-disable no-unused-vars */
    public abstract play(): void;
    public abstract pause(): void;
    public abstract toggle(): boolean;
    public abstract seek(value: number): void;
    public abstract toggleMute(mute?: boolean): void;
    public abstract unload(): void;
    public abstract load(data: IPlayerSettings): any | Promise<any>;
    public abstract preload(): Promise<any>;
    public abstract skipForward(more?: boolean): void;
    public abstract skipBackward(more?: boolean): void;
    public abstract restart(): void;
    public abstract end(): void;
    public abstract volumeUp(): void;
    public abstract volumeDown(): void;
    public abstract speedUp(): void;
    public abstract speedDown(): void;
    public abstract goRewind(): void;
    public abstract goForward(): void;

    protected abstract isPaused(): boolean;
    protected abstract setup(): void;
    protected abstract createPlayer(): void;
    protected abstract bindPlayer(): void;
    protected abstract unbindPlayer(): void;

    protected abstract onDurationChange(data?): void;
    protected abstract onError (error): void;
    protected abstract onProgress(data?): void;
    protected abstract onTimeupdate(data?): void;
    /* eslint-enable no-unused-vars */


    public hide(): void { this.view.style.display = 'none'; }
    public show(): void { this.view.style.display = 'block'; }
    public resize = (): void => {};

    public setVolume(volume: number): void {
        this.ui.volume.update(volume);
        this.ui.volume.toggle(volume < 0.05);
        Utils.setStorageItem(PlayerStorage.VOLUME, `${volume}`);
    }

    public setSpeed(speed: number): void {
        this.ui.settings?.updateSpeed(speed);
        Utils.setStorageItem(PlayerStorage.SPEED, `${speed}`);
    }

    public destroy(): void {
        delete Player.instances[this.uid];

        if (this.ui) {
            this.ui.time?.destroy();
            this.ui.timeline?.destroy();
            this.ui.volume?.destroy();
            this.ui.popups.destroy();
            this.ui.settings?.destroy();
            this.ui.time = null;
            this.ui.timeline = null;
            this.ui.volume = null;
            this.ui.playPauseBtn = null;
            this.ui.bottomPanel = null;
            this.ui.toggleBtn = null;
        }

        this.unbind();
        this.unload();

        this.view.classList.remove('is-initialized');

        super.destroy();
    }



    protected buildUI(): void {
        const template = Templates.get(TemplateNames.PLAYER);
        const html = template.render({});

        this.view.insertAdjacentHTML('beforeend', html);

        this.ui = {
            fullscreen: new PlayerFullscreen(this.view.querySelector('.js-player-fullscreen'), this.view),
            timeline: new PlayerTimeline(this.view.querySelector('.js-player-timeline'), this.view),
            popups: new PlayerPopups(this.view.querySelector('.js-player-popups')),
            volume: new PlayerVolume(this.view.querySelector('.js-player-volume'), this.view),
            time: new PlayerTime(this.view),
            poster: new PlayerPoster(this.view.querySelector('.js-player-poster'), this.view),
            // settings: new PlayerSettings(this.view.querySelector('.js-player-settings'), this.view),
            bottomPanel: this.view.querySelector('.js-player-bottom'),
            playPauseBtn: this.view.querySelector('.js-player-playpause'),
            toggleBtn: this.view.querySelector('.js-player-toggle'),
            playerBar: this.view.querySelector('.js-player-bar'),
            rewindBtn: this.view.querySelector('.js-player-rewind'),
            forwardBtn: this.view.querySelector('.js-player-forward'),
        };

        this.view.classList.toggle('has-autoplay', this.settings.autoplay);
        this.view.classList.toggle('has-autoplay', this.settings.autoplay);
        this.view.classList.add('has-controls');

        this.settings.muted && this.ui.volume?.toggle(true);

        // poster
        this.ui.poster.load(this.settings);


        PushStates.bind(this.view);
    }



    protected bind(): void {
        this.ui.timeline?.on(PlayerTimelineEvents.SEEK, (position: number) => this.seek(position));
        this.ui.volume?.on(PlayerVolumeEvents.CHANGE, (volume: number) => this.setVolume(volume));
        this.ui.volume?.on(PlayerVolumeEvents.MUTE, () => this.toggleMute(true));
        this.ui.volume?.on(PlayerVolumeEvents.UNMUTE, () => this.toggleMute(false));
        this.ui.settings?.on(PlayerSettingsEvents.SPEED, speed => this.setSpeed(speed));

        this.ui.playPauseBtn?.addEventListener('click', this.onToggleClick);
        this.ui.toggleBtn?.addEventListener('click', this.onToggleClick);
        this.ui.toggleBtn?.addEventListener('dblclick', this.onDoubleClick);

        this.ui.rewindBtn?.addEventListener('click', () => this.goRewind());
        this.ui.forwardBtn?.addEventListener('click', () => this.goForward());

        !!this.settings.hotkeys && document.addEventListener('keydown', this.onKeyDown);

        this.ui.fullscreen?.on(PlayerFullscreenEvents.ENTER, this.onFullscreenEnter);
        this.ui.fullscreen?.on(PlayerFullscreenEvents.EXIT, this.onFullscreenExit);

        this.settings.pauseOnScroll && this.pauseOnScroll();

        window.addEventListener('beforeunload', () => this.onBeforeunload());
        window.addEventListener('pagehide', () => this.onBeforeunload());

        this.bindPlayer();
    }



    protected unbind(): void {
        this.ui?.timeline?.off();
        this.ui?.volume?.off();

        this.ui?.playPauseBtn?.removeEventListener('click', this.onToggleClick);
        this.ui?.toggleBtn?.removeEventListener('click', this.onToggleClick);
        this.ui?.toggleBtn?.removeEventListener('dblclick', this.onDoubleClick);

        !!this.settings.hotkeys && document.removeEventListener('keydown', this.onKeyDown);

        this.ui.fullscreen?.off();
        this.st?.kill();

        window.removeEventListener('beforeunload', () => this.onBeforeunload());
        window.removeEventListener('pagehide', () => this.onBeforeunload());

        this.unbindPlayer();
    }



    protected onCanplay(): void {
        this.view.classList.add('is-canplay');
        this.view.classList.remove('is-error');
    }



    protected onPlay(): void {
        this.view.classList.add('is-played');
        this.view.classList.remove('is-ended', 'is-error', 'is-share-open');
        Player.pauseAll(this.uid);
        this.updateMediaSession();
    }



    protected onPlaying(): void {
        this.view.classList.add('is-playing');
        this.view.classList.remove('is-loading', 'is-error');
        this.trigger(PlayerEvents.PLAY);
        navigator.mediaSession.playbackState = 'playing';
    }



    protected onPause(): void {
        this.view.classList.remove('is-playing', 'is-share-open');
        this.trigger(PlayerEvents.PAUSE);
        navigator.mediaSession.playbackState = 'paused';
    }



    protected onWaiting(): void {
        this.view.classList.remove('is-playing');
        this.view.classList.add('is-loading');
    }



    protected onEnd(): void {
        this.view.classList.remove('is-playing', 'is-played', 'is-started', 'is-loading');
        this.view.classList.add('is-ended');

        if (!this.settings.autoplay) {
            this.trigger(PlayerEvents.END);
        }
    }



    protected onToggleClick = (e): void => {
        e.preventDefault();
        e.stopPropagation();
        this.toggle();
    };



    protected onDoubleClick = (e): void => {
        e.preventDefault();
        e.stopPropagation();
        this.ui?.fullscreen?.toggle();
    };



    protected onBeforeunload(): void {}



    protected onKeyDown = e => {

        if (document.querySelector('#transcript-search') === document.activeElement) { return; }

        switch (e.key) {
            case ' ':
            case 'k':
                e.preventDefault();
                e.stopPropagation();
                this.toggle();
                break;

            case 'ArrowRight':
                e.preventDefault();
                e.stopPropagation();
                this.skipForward();
                break;

            case 'l':
                e.preventDefault();
                e.stopPropagation();
                this.skipForward(true);
                break;

            case 'ArrowLeft':
                e.preventDefault();
                e.stopPropagation();
                this.skipBackward();
                break;

            case 'j':
                e.preventDefault();
                e.stopPropagation();
                this.skipBackward(true);
                break;

            case 'm':
                e.preventDefault();
                e.stopPropagation();
                this.toggleMute();
                break;

            case '>':
                e.preventDefault();
                e.stopPropagation();
                this.speedUp();
                break;

            case '<':
                e.preventDefault();
                e.stopPropagation();
                this.speedDown();
                break;

            case 'Home':
            case '0':
                e.preventDefault();
                e.stopPropagation();
                this.restart();
                break;

            case 'End':
                e.preventDefault();
                e.stopPropagation();
                this.end();
                break;

            case 'ArrowUp':
                e.preventDefault();
                e.stopPropagation();
                this.volumeUp();
                break;

            case 'ArrowDown':
                e.preventDefault();
                e.stopPropagation();
                this.volumeDown();
                break;

            case 'f':
                e.preventDefault();
                e.stopPropagation();
                this.ui?.fullscreen?.toggle();
                break;

            case 'c':
                e.preventDefault();
                e.stopPropagation();
                this.ui?.captions?.toggle();
                break;

            default:
                break;
        }
    };



    protected onFullscreenEnter = () => {
        this.ui?.captions?.showNative();
    };



    protected onFullscreenExit = () => {
        this.ui?.captions?.hideNative();
    };



    protected pauseOnScroll(): void {
        this.st = ScrollTrigger.create({
            trigger: this.view,
            onToggle: self => {
                !self.isActive && !this.ui.fullscreen?.isFullscreen() && this.pause();
            },
        });
    }



    protected updateMediaSession(): void {
        if ('mediaSession' in navigator && this.settings.metadata) {

            navigator.mediaSession.metadata = new MediaMetadata({ ...this.settings.metadata as any });

            navigator.mediaSession.setActionHandler('play', () => this.play());
            navigator.mediaSession.setActionHandler('pause', () => this.pause());
            navigator.mediaSession.setActionHandler('seekbackward', () => this.skipBackward(true));
            navigator.mediaSession.setActionHandler('seekforward', () => this.skipForward(true));
            navigator.mediaSession.setActionHandler('seekto', () => {}); // just enable seeking

            // TODO: use this in playlists in the future
            // navigator.mediaSession.setActionHandler('previoustrack', () => { });
            // navigator.mediaSession.setActionHandler('nexttrack', () => { });
        }
    }
}
