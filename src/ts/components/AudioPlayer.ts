import { gsap } from 'gsap/dist/gsap';
import { easing } from '../Site';
import { Video } from './Player/Video';


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

        this.ui.thumbnail = this.view.querySelector('.player__thumbnail');
        this.ui.minimize = this.view.querySelector('.player__minimize');
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
        this.ui.thumbnail && this.ui.thumbnail.addEventListener('click', this.onThumbnailClick);
        this.ui.minimize && this.ui.minimize.addEventListener('click', this.onMinimizeClick);
    };



    private onThumbnailClick = (): void => {
        this.isExpanded ? this.minimize() : this.expand();
        this.view.classList.toggle('is-expanded');
    };



    private onMinimizeClick = (): void => this.minimize();



    private minimize = (): void => {
        gsap.to(this.ui.playerBar, {
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
        gsap.to(this.ui.playerBar, {
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
