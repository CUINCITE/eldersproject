import { gsap } from 'gsap/dist/gsap';
import { PushStates } from '../PushStates';
import { easing } from '../Site';
import { Video } from './Player/Video';
import { Lightbox } from './Lightbox/Lightbox';


export class AudioPlayerStatesText {
    public static RANDOM = 'Shuffle';
    public static PLAYING = 'Now playing';
    public static PAUSED = 'Play interview';
}

export interface IAudioPlayerMedia {
    src: string;
    duration: string;
}
export interface IAudioPlayerResponse {
    id: string;
    src: IAudioPlayerMedia[];
    title: string;
    urlInterview: string;
    nextId?: string;
    prevId?: string;
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
    public static currentAudioId: string;

    public static closeAudioPlayer(): void {
        AudioPlayer.instance.minimize();
    }



    public static openAudioPlayer(fromLightbox?: boolean): void {
        AudioPlayer.instance.expand();
        if (fromLightbox && !AudioPlayer.instance.isInitialized) AudioPlayer.instance.setNewAudio(Lightbox.currentId, true);
    }



    public static getId(): string {
        return AudioPlayer.currentAudioId;
    }



    public static isAudioPlayerPaused(): boolean {
        return AudioPlayer.instance.isPaused();
    }


    public static updateColors(color: string): void {
        AudioPlayer.instance.updateColors(color);
    }



    private isExpanded = false;
    private cassetteTitle: HTMLElement;
    private apiUrl: string;
    private elements: IAudioPlayerResponseElements;
    private playerButtons: NodeListOf<HTMLButtonElement>;
    private isInitialized = false;
    private closeTimeout: any;

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


        this.bindAudioPlayer();
    }



    public bindButtons = (): void => {
        // bind new buttons after each page transition

        document.querySelectorAll('[data-audio-player]').forEach(button => {
            button.addEventListener('click', this.onBtnClick);
        });
    };



    protected onBtnClick = (e): void => {
        e.preventDefault();
        e.stopPropagation();

        const id = (e.currentTarget as HTMLElement).dataset.audioPlayer;
        const startTime = (e.currentTarget as HTMLElement).dataset.start;
        if (!id) return;

        if (id !== AudioPlayer.currentAudioId) {
            // if button has different id than audio player, load new audio and play
            this.setNewAudio(id, true, startTime);
        } else {
            // if button has the same id as current audio, only toggle player
            // eslint-disable-next-line no-lonely-if
            if (startTime) {
                this.media.currentTime = parseInt(startTime, 10);
                this.play();
            } else {
                this.isPaused() ? this.play() : this.pause();
            }
        }
    };



    protected onPlay(): void {
        super.onPlay();
        this.setTitleInCassette(`${AudioPlayerStatesText.PLAYING}: ${this.elements.title.innerText}`);
        this.togglePlayerButtons(true);
    }



    protected onPause(): void {
        super.onPause();
        this.setTitleInCassette(`${AudioPlayerStatesText.PAUSED}: ${this.elements.title.innerText}`);
        this.togglePlayerButtons(false);
    }



    private togglePlayerButtons = (isPlaying: boolean): void => {
        this.playerButtons = document.querySelectorAll(`[data-audio-player="${AudioPlayer.currentAudioId}"]`);
        this.playerButtons.forEach(btn => btn.classList.toggle('is-playing', isPlaying));
    };



    private bindAudioPlayer = (): void => {
        this.ui.thumbnail && this.ui.thumbnail.addEventListener('click', this.onThumbnailClick);
        this.ui.minimize && this.ui.minimize.addEventListener('click', this.onMinimizeClick);
        this.elements.nextBtn && this.elements.nextBtn.addEventListener('click', this.onNextClick);
        this.elements.prevBtn && this.elements.prevBtn.addEventListener('click', this.onPrevClick);
        this.elements.urlLink && this.elements.urlLink.addEventListener('click', this.onUrlClick);

        this.view.addEventListener('mouseleave', this.onMouseLeave);
        this.view.addEventListener('mouseenter', this.onMouseEnter);
    };



    private onMouseLeave = (e): void => {
        this.closeTimeout = setTimeout(() => {
            this.minimize();
        }, 5000);
    };



    private onMouseEnter = (e): void => {
        clearTimeout(this.closeTimeout);
    };



    private onUrlClick = (e): void => {
        e.preventDefault();
        e.stopPropagation();


        PushStates.goTo(e.currentTarget.getAttribute('href'), Lightbox.isOpen);
    };



    private setNewAudio = (id?: string, play?: boolean, startTime?: string): void => {
        this.loadAudio(id).then((data: IAudioPlayerResponse) => {
            this.updatePlayer(data);
            // check if lightbox is open and has the same id as audio player
            Lightbox.checkPlayerState();
            // play audio when it has been already initialized
            if (play) {
                !this.isExpanded && this.expand();
                this.media.currentTime = startTime ? parseInt(startTime, 10) : 0;
                this.play();
            }
            this.isInitialized = true;
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
        // when lightbox is open, do not minimize the player - it should be always expanded
        if (Lightbox.isOpen) return;

        // if audio player is not initialized yet, load random audio
        if (!this.isInitialized) this.setNewAudio();

        this.isExpanded ? this.minimize() : this.expand();
        this.view.classList.toggle('is-expanded');
    };



    private onMinimizeClick = (): void => this.minimize();



    private minimize = (): void => {
        // when lightbox is open, do not minimize the player - it should be always expanded
        if (Lightbox.isOpen) return;

        gsap.to(this.ui.playerBar, {
            yPercent: 0,
            duration: 0.7,
            ease: easing,
            onComplete: () => {
                // eslint-disable-next-line max-len
                this.setTitleInCassette(this.isPaused() ? `${AudioPlayerStatesText.PAUSED}: ${this.elements.title.innerText}` : `${AudioPlayerStatesText.PLAYING}: ${this.elements.title.innerText}`);
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
                // eslint-disable-next-line max-len
                this.setTitleInCassette(this.isPaused() ? `${AudioPlayerStatesText.PAUSED}: ${this.elements.title.innerText}` : `${AudioPlayerStatesText.PLAYING}: ${this.elements.title.innerText}`);
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
        AudioPlayer.currentAudioId = data.id;
        // TO DO - add multiple sources
        this.media.src = data.src[0].src;
        this.elements.title.innerText = data.title;
        this.elements.urlLink.href = data.urlInterview;
        this.elements.nextBtn.dataset.nextId = data.nextId?.toString() || '';
        this.elements.prevBtn.dataset.prevId = data.prevId?.toString() || '';
    };



    private async loadAudio(id?: string): Promise<IAudioPlayerResponse> {
        const isWorkspace = window.location.pathname.indexOf('/workspace/') >= 0;

        // url for workspace handles the id differently - adding .json at the end for local reading json file
        const url = isWorkspace
            ? `${this.apiUrl}${id ? `0${id}` : '01'}.json`
            : `${this.apiUrl}${id ? `?id=${id}` : ''}`;
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



    private updateColors = (color: string): void => {
        this.view.style.setProperty('--lightbox-color', `var(--color-${color})`);

        // remove all previous color modifiers (if exist)
        const classes = this.view.className.split(' ').filter(c => !c.startsWith('audioplayer--'));
        this.view.className = classes.join(' ').trim();

        // add new color modifier
        this.view.classList.add(`audioplayer--${color}`);
    };
}
