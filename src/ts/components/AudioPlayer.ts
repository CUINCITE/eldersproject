import { gsap } from 'gsap/dist/gsap';
import { Video } from './Video';


export class AudioPlayerStatesText {
    public static RANDOM = 'Play random interview';
    public static PLAYING = 'Playing interview';
    public static PAUSED = 'Play interview';
}

export class AudioPlayer extends Video {

    private audioTitle: HTMLElement;
    private isExpanded = false;
    private cassetteTitle: HTMLElement;

    constructor(protected view: HTMLElement) {
        super(view);


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
            xPercent: 0,
            duration: 1,
            ease: 'power3.inOut',
            onComplete: () => {
                this.setTitleInCassette(this.audioTitle.innerText);
                this.isExpanded = false;
            },
        });
    };



    private expand = (): void => {
        gsap.to(this.controls.playerBar, {
            xPercent: -100,
            duration: 1,
            ease: 'power3.inOut',
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