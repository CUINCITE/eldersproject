import { gsap } from 'gsap/dist/gsap';
import { PushStates } from '../PushStates';
import { breakpoint, easing } from '../Site';
import { Video } from './Player/Video';
import { Lightbox } from './Lightbox/Lightbox';
import { ISwipeCoordinates, Swipe, SwipeDirections, SwipeEvents } from './Swipe';


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
    color: string;
    nextId?: string;
    prevId?: string;
}


export interface IAudioPlayerResponseElements {
    urlLinks: NodeListOf<HTMLAnchorElement>;
    nextBtn: HTMLButtonElement;
    prevBtn: HTMLButtonElement;
    title: HTMLElement;
}

export class AudioPlayer extends Video {

    // eslint-disable-next-line no-use-before-define
    public static instance: AudioPlayer;
    public static currentAudioId: string;
    public static view: HTMLElement;

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



    private isExpanded = false;
    private cassetteEl: HTMLElement;
    private cassetteTitle: HTMLElement;
    private apiUrl: string;
    private elements: IAudioPlayerResponseElements;
    private playerButtons: NodeListOf<HTMLButtonElement>;
    private isInitialized = false;
    private closeTimeout: any;
    private mobileCover: HTMLElement;
    private mobileIllustration: HTMLElement;
    private swipeComp: Swipe;
    private startX: number;
    private x: number = 0;
    private swipeMargin = 10;

    constructor(protected view: HTMLElement) {
        super(view);

        AudioPlayer.instance = this;
        AudioPlayer.view = view;

        this.ui.thumbnail = this.view.querySelector('.js-player-thumbnail');
        this.ui.minimize = this.view.querySelectorAll('.js-player-minimize');
        this.cassetteTitle = this.view.querySelector('.js-player-marquee');
        this.cassetteEl = this.view.querySelector('.js-player-cassette');
        this.mobileCover = this.view.querySelector('.js-player-cover');
        this.mobileIllustration = this.view.querySelector('.js-player-illustration');

        this.apiUrl = this.view.dataset.apiUrl;

        this.elements = {
            urlLinks: this.view.querySelectorAll('.js-player-url'),
            nextBtn: this.view.querySelector('.js-player-next'),
            prevBtn: this.view.querySelector('.js-player-prev'),
            title: this.view.querySelector('.js-player-title'),
        };

        this.minimize(true);
        this.bindAudioPlayer();
    }



    public bindButtons = (): void => {
        // bind new buttons after each page transition

        document.querySelectorAll('[data-audio-player]').forEach(button => {
            button.addEventListener('click', this.onBtnClick);
        });
    };



    protected onTimeupdate = (): void => {
        super.onTimeupdate();
        Lightbox.isOpen && Lightbox.tryToUpdateTranscript(this.media.currentTime);
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
            if (startTime && this.isPaused()) {
                this.media.currentTime = Math.max(this.media.currentTime, parseInt(startTime, 10));
                this.play();
            } else this.isPaused() ? this.play() : this.pause();
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
        // set all buttons to paused state
        document.querySelectorAll('[data-audio-player]').forEach(btn => btn.classList.remove('is-playing'));

        this.playerButtons = document.querySelectorAll(`[data-audio-player="${AudioPlayer.currentAudioId}"]`);
        this.playerButtons.forEach(btn => btn.classList.toggle('is-playing', isPlaying));
    };



    private goToPreviousTrack = (): void => {
        this.onPrevClick();
    };



    private goToNextTrack = (): void => {
        this.onNextClick();
    };



    private bindAudioPlayer = (): void => {
        this.ui.thumbnail && this.ui.thumbnail.addEventListener('click', this.onThumbnailClick);
        this.ui.minimize && [...this.ui.minimize].forEach(btn => btn.addEventListener('click', this.onMinimizeClick));
        this.elements.nextBtn && this.elements.nextBtn.addEventListener('click', this.onNextClick);
        this.elements.prevBtn && this.elements.prevBtn.addEventListener('click', this.onPrevClick);
        this.elements.urlLinks && [...this.elements.urlLinks].forEach(link => link.addEventListener('click', this.onUrlClick));

        if (breakpoint.desktop) {
            this.view.addEventListener('mouseleave', this.onMouseLeave);
            this.view.addEventListener('mouseenter', this.onMouseEnter);
        } else {
            this.swipeComp = new Swipe(this.mobileCover, { horizontal: true, vertical: true });

            this.bindSwipeEvents();
        }

        if ('mediaSession' in navigator && this.settings.metadata) {
            // prev/next media buttons (keyboard)
            navigator.mediaSession.setActionHandler('previoustrack', () => this.goToPreviousTrack());
            navigator.mediaSession.setActionHandler('nexttrack', () => this.goToNextTrack());
        }
    };



    private bindSwipeEvents = (): void => {
        this.swipeComp.on(SwipeEvents.START, e => {
            this.startX = this.x;
        });

        this.swipeComp.on(SwipeEvents.UPDATE, e => {
            this.x = this.startX + e.deltaX;

            (Math.abs(this.x) > this.swipeMargin) && this.moveIllustration();
        });

        this.swipeComp.on(SwipeEvents.END, (e: ISwipeCoordinates) => {
            this.x = 0;

            switch (e.direction) {
                case SwipeDirections.LEFT:
                    this.onPrevClick();
                    break;
                case SwipeDirections.RIGHT:
                    this.onNextClick();
                    break;
                case SwipeDirections.UP:
                    PushStates.goTo(this.elements.urlLinks[0].getAttribute('href'), Lightbox.isOpen);
                    break;
                case SwipeDirections.DOWN:
                    this.minimize();
                    break;
                default:
                    // resetted earlier to 0, center illu when no action
                    this.moveIllustration();
                    console.warn('no direction');
            }
        });
    };



    private moveIllustration = (): void => {
        gsap.to(this.mobileIllustration, {
            x: this.x,
            duration: 0.15,
            ease: 'none',
        });
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



    private setNewAudio = (id?: string, play?: boolean, startTime?: string, prevDirection?: boolean): void => {
        this.animateOutIllustration(prevDirection);
        this.loadAudio(id)
            .then((data: IAudioPlayerResponse) => {
                this.animateOutCassette();
                this.updatePlayer(data);
                this.updateColors(data.color);
                // this.animateInCassette();
                this.animateInIllustration(prevDirection);
                // eslint-disable-next-line max-len
                this.setTitleInCassette(this.isPaused() ? `${AudioPlayerStatesText.PAUSED}: ${this.elements.title.innerText}` : `${AudioPlayerStatesText.PLAYING}: ${this.elements.title.innerText}`);

                // check if lightbox is open and has the same id as audio player
                Lightbox.checkPlayerState();

                // at first load, check if URL has start time for audio
                const hasParams = this.isInitialized ? false : this.seekToParams();
                // play audio when it has been already initialized
                if (play) {
                    !this.isExpanded && this.expand();
                    if (!hasParams) this.media.currentTime = startTime ? parseInt(startTime, 10) : 0;
                    this.play();
                }
                this.isInitialized = true;
            });
    };



    private animateOutCassette = (): Promise<void> => new Promise(resolve => {
        this.elements.title.innerText = 'Loading...';
        gsap.to(this.cassetteEl, {
            yPercent: breakpoint.desktop ? 130 : 0,
            xPercent: breakpoint.desktop ? 0 : -130,
            rotate: -20,
            duration: 0.5,
            ease: 'power2.out',
            clearProps: 'all',
            onStart: () => {
                this.cassetteEl.style.zIndex = '2';
            },
            onComplete: () => {
                this.cassetteEl.style.zIndex = '0';
                resolve();
            },
        });
    });



    private animateOutIllustration = (left: boolean): void => {

        gsap.to(this.mobileIllustration, {
            x: left ? -window.innerWidth : window.innerWidth,
            duration: 0.5,
            ease: 'power2.out',
            onComplete: () => {
                this.mobileIllustration.style.opacity = '0';
            },
        });
    };



    private animateInIllustration = (left: boolean): void => {

        gsap.fromTo(this.mobileIllustration, { x: left ? window.innerWidth / 2 : -window.innerWidth / 2 }, {
            x: 0,
            duration: 0.5,
            ease: 'power2.out',
            onStart: () => {
                this.mobileIllustration.style.opacity = '1';
            },
        });
    };



    private animateInCassette = (): void => {
        gsap.fromTo(this.cassetteEl, { yPercent: breakpoint.desktop ? 100 : 0, xPercent: breakpoint.desktop ? 0 : -100 }, {
            yPercent: 0,
            xPercent: 0,
            duration: 0.5,
            ease: 'power2.out',
            clearProps: 'all',
            onStart: () => {
                this.cassetteEl.style.opacity = '1';
            },
        });
    };



    private onNextClick = (): void => {
        const { nextId } = this.elements.nextBtn.dataset;
        this.setNewAudio(nextId, true, '', false);
    };



    private onPrevClick = (): void => {
        const { prevId } = this.elements.prevBtn.dataset;
        this.setNewAudio(prevId, true, '', true);
    };



    private onThumbnailClick = (): void => {
        // when lightbox is open, do not minimize the player - it should be always expanded
        if (Lightbox.isOpen) return;

        // if audio player is not initialized yet, load random audio
        if (!this.isInitialized) this.setNewAudio();

        this.isExpanded ? this.minimize() : this.expand();
    };



    private onMinimizeClick = (): void => this.minimize();



    private minimize = (fast?: boolean): void => {
        // when lightbox is open, do not minimize the player - it should be always expanded
        if (Lightbox.isOpen) return;

        this.view.classList.remove('is-expanded');

        gsap.to(this.ui.playerBar, {
            yPercent: 100,
            duration: fast ? 0 : 0.7,
            ease: easing,
            onStart: () => {
                document.documentElement.classList.remove('is-overflow-hidden');
            },
            onComplete: () => {
                gsap.set(this.ui.playerBar, { y: 0, yPercent: 100 });
                // eslint-disable-next-line max-len
                !fast && this.setTitleInCassette(this.isPaused() ? `${AudioPlayerStatesText.PAUSED}: ${this.elements.title.innerText}` : `${AudioPlayerStatesText.PLAYING}: ${this.elements.title.innerText}`);
                this.isExpanded = false;
                this.ui.playerBar.style.display = 'none';
            },
        });
    };



    private expand = (): void => {
        this.ui.playerBar.style.display = 'grid';
        this.view.classList.add('is-expanded');

        gsap.to(this.ui.playerBar, {
            yPercent: 0,
            duration: 0.7,
            ease: easing,
            onStart: () => {
                // eslint-disable-next-line max-len
                this.setTitleInCassette(this.isPaused() ? `${AudioPlayerStatesText.PAUSED}: ${this.elements.title.innerText}` : `${AudioPlayerStatesText.PLAYING}: ${this.elements.title.innerText}`);
            },
            onComplete: () => {
                this.isExpanded = true;
                gsap.set(this.ui.playerBar, { y: 0, yPercent: 0 });
                document.documentElement.classList.add('is-overflow-hidden');
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
        [...this.elements.urlLinks].forEach(link => {
            link.href = data.urlInterview;
        });
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
