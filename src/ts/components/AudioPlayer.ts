import { gsap } from 'gsap/dist/gsap';
import { easing } from '../Site';
import { Video } from './Player/Video';


export class AudioPlayerStatesText {
    public static RANDOM = 'Play random interview';
    public static PLAYING = 'Playing interview';
    public static PAUSED = 'Play interview';
}


export interface IAudioPlayerResponse {
    id: number;
    src: string;
    title: string;
    interviewUrl: string;
    nextId?: number;
    prevId?: number;
    duration?: number;
}


export interface IAudioPlayerResponseElements {
    urlLink: HTMLAnchorElement;
    nextBtn: HTMLButtonElement;
    prevBtn: HTMLButtonElement;
    title: HTMLElement;
}

export class AudioPlayer extends Video {

    // eslint-disable-next-line no-use-before-define
    public static instance: AudioPlayer;

    public static closeAudioPlayer(): void {
        AudioPlayer.instance.minimize();
    }


    private isExpanded = false;
    private cassetteTitle: HTMLElement;
    private apiUrl: string;
    private currentAudioId: number;
    private elements: IAudioPlayerResponseElements;

    constructor(protected view: HTMLElement) {
        super(view);

        AudioPlayer.instance = this;

        this.ui.thumbnail = this.view.querySelector('.js-player-thumbnail');
        this.ui.minimize = this.view.querySelector('.js-player-minimize');
        this.cassetteTitle = this.view.querySelector('.js-player-marquee');
        this.apiUrl = this.view.dataset.apiUrl;

        this.elements = {
            urlLink: this.view.querySelector('.js-player-url'),
            nextBtn: this.view.querySelector('.js-player-next'),
            prevBtn: this.view.querySelector('.js-player-prev'),
            title: this.view.querySelector('.js-player-title'),
        };


        this.init();
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



    private init = (): void => {
        this.setNewAudio();
    };



    private bindAudioPlayer = (): void => {
        this.ui.thumbnail && this.ui.thumbnail.addEventListener('click', this.onThumbnailClick);
        this.ui.minimize && this.ui.minimize.addEventListener('click', this.onMinimizeClick);
        this.elements.nextBtn && this.elements.nextBtn.addEventListener('click', this.onNextClick);
        this.elements.prevBtn && this.elements.prevBtn.addEventListener('click', this.onPrevClick);
    };



    private setNewAudio = (id?: string, play?: boolean): void => {
        this.loadAudio(id).then((data: IAudioPlayerResponse) => {
            this.updatePlayer(data);
            // play audio when it has been already initialized
            play && this.play();
        });
    };



    private onNextClick = (): void => {
        const { nextId } = this.elements.nextBtn.dataset;
        this.setNewAudio(nextId, true);
    };



    private onPrevClick = (): void => {
        const { prevId } = this.elements.prevBtn.dataset;
        this.setNewAudio(prevId, true);
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
                this.setTitleInCassette(this.elements.title.innerText);
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



    private updatePlayer = (data: IAudioPlayerResponse): void => {
        this.currentAudioId = data.id;
        this.media.src = data.src;
        this.elements.title.innerText = data.title;
        this.elements.urlLink.href = data.interviewUrl;
        this.elements.nextBtn.dataset.nextId = data.nextId.toString() || '';
        this.elements.prevBtn.dataset.prevId = data.prevId.toString() || '';
    };



    private async loadAudio(id?: string): Promise<IAudioPlayerResponse> {
        const isWorkspace = window.location.pathname.indexOf('/workspace/') >= 0;

        // url for workspace handles the id differently - adding .json at the end for local reading json file
        const url = isWorkspace
            ? `${this.apiUrl}${id ? `0${id}` : '01'}.json`
            : `${this.apiUrl}${id || ''}`;
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Elder-Api': 'true',
                },
            });

            const data = await response.json();
            this.view.classList.remove('is-fetching');

            return data;

        } catch (error) {
            this.view.classList.remove('is-fetching');
            throw new Error(error);
        }
    }
}
