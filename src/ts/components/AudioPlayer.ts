import { gsap } from 'gsap/dist/gsap';
import { easing } from '../Site';
import { Video } from './Video';


export class AudioPlayerStatesText {
    public static RANDOM = 'Play random interview';
    public static PLAYING = 'Playing interview';
    public static PAUSED = 'Play interview';
}

export class AudioPlayer extends Video {

    // eslint-disable-next-line no-use-before-define
    public static instance: AudioPlayer;

    public static closeAudioPlayer(): void {
        AudioPlayer.instance.minimize();
    }


    private audioTitle: HTMLElement;
    private isExpanded = false;
    private cassetteTitle: HTMLElement;

    constructor(protected view: HTMLElement) {
        super(view);

        AudioPlayer.instance = this;

        this.controls.thumbnail = this.view.querySelector('.player__thumbnail');
        this.controls.minimize = this.view.querySelector('.player__minimize');
        this.audioTitle = this.view.querySelector('.player__title');
        this.cassetteTitle = this.view.querySelector('.player__marquee');

        this.bindAudioPlayer();
    }



    protected onPlay(): void {
        super.onPlay();
        this.setTitleInCassette(AudioPlayerStatesText.PLAYING);
    }



    protected onPause(): void {
        super.onPause();
        this.setTitleInCassette(AudioPlayerStatesText.PAUSED);
    }



    private bindAudioPlayer = (): void => {
        this.controls.thumbnail && this.controls.thumbnail.addEventListener('click', this.onThumbnailClick);
        this.controls.minimize && this.controls.minimize.addEventListener('click', this.onMinimizeClick);
    };



    private onThumbnailClick = (): void => {
        this.isExpanded ? this.minimize() : this.expand();
        this.view.classList.toggle('is-expanded');
    };



    private onMinimizeClick = (): void => this.minimize();



    private minimize = (): void => {
        gsap.to(this.controls.playerBar, {
            yPercent: 0,
            duration: 0.7,
            ease: easing,
            onComplete: () => {
                this.setTitleInCassette(this.audioTitle.innerText);
                this.isExpanded = false;
            },
        });
    };



    private expand = (): void => {
        gsap.to(this.controls.playerBar, {
            yPercent: -100,
            duration: 0.7,
            ease: easing,
            onStart: () => {
                this.setTitleInCassette(this.isPaused() ? AudioPlayerStatesText.PAUSED : AudioPlayerStatesText.PLAYING);
            },
            onComplete: () => {
                this.isExpanded = true;
            },
        });
    };



    private setTitleInCassette = (text: string): void => {
        [...this.cassetteTitle.querySelectorAll('span')].forEach(span => {
            span.innerText = text;
        });
    };
}
