import { gsap } from 'gsap/dist/gsap';
import { getStorageItem, setStorageItem } from '../Utils';
import { PushStates } from '../PushStates';
import { breakpoint, easing, local } from '../Site';
import { Videos } from './Player/Videos';
import { Lightbox } from './Lightbox/Lightbox';
import { ISwipeCoordinates, Swipe, SwipeDirections, SwipeEvents } from './Swipe';
import { Images } from '../widgets/Images';
import { PlayerEvents } from './Player/Player.types';


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
    collectionImage: {
        original: string;
        mobile_x2: string;
        mobile_x2_webp: string;
    }
}


export interface IAudioPlayerResponseElements {
    urlLinks: NodeListOf<HTMLAnchorElement>;
    nextBtn: HTMLButtonElement;
    prevBtn: HTMLButtonElement;
    title: HTMLElement;
}


export interface IAudioPlayerQueueItem {
    active: boolean;
    id: string;
    timestamp?: number;
}

export class AudioPlayer extends Videos {

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
    private timeout: ReturnType<typeof setTimeout>;
    private audioWrapper: HTMLElement;
    private isHorizontalPhone = false;
    private playerQueue: IAudioPlayerQueueItem[];
    private activeQueueIndex: number = 0;
    private queueLimit = 100;
    private isFetching = false;

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
        this.audioWrapper = this.view.querySelector('.js-audio');

        this.apiUrl = this.view.dataset.apiUrl;

        this.elements = {
            urlLinks: this.view.querySelectorAll('.js-player-url'),
            nextBtn: this.view.querySelector('.js-player-next'),
            prevBtn: this.view.querySelector('.js-player-prev'),
            title: this.view.querySelector('.js-player-title'),
        };


        this.tryToGetQueue();
        this.minimize(true);
        this.bindAudioPlayer();
        this.checkOrientation();
    }



    public bindButtons = (): void => {
        // bind new buttons after each page transition

        document.querySelectorAll('[data-audio-player]').forEach(button => {
            button.addEventListener('click', this.onBtnClick);
        });
    };



    protected onTimeupdate = (): void => {
        super.onTimeupdate();
        this.updateQueueTimestamp();
    };



    protected onBtnClick = (e): void => {
        e.preventDefault();
        e.stopPropagation();

        const id = (e.currentTarget as HTMLElement).dataset.audioPlayer;
        const startTime = (e.currentTarget as HTMLElement).dataset.start;
        const isToggle = (e.currentTarget as HTMLElement).hasAttribute('data-toggle');

        if (!id) return;

        if (id !== AudioPlayer.currentAudioId) {
            // if button has different id than audio player, load new audio and play
            this.setNewAudio(id, true, startTime, 1, true);
        } else {
            // if button has the same id as current audio, only toggle player
            // eslint-disable-next-line no-lonely-if
            if (startTime) {
                if (isToggle) {
                    this.seekToTime(Math.max(this.media.currentTime, parseInt(startTime, 10)));
                    this.isPaused() ? this.play() : this.pause();
                } else {
                    this.seekToTime(parseInt(startTime, 10));
                    this.play();
                }
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



    private tryToGetQueue = (): void => {
        const queue = getStorageItem('audioQueue');
        if (queue) {
            // parse queue from local storage
            this.playerQueue = JSON.parse(queue);

            // find active item in queue and assign it to component's property
            this.activeQueueIndex = this.playerQueue.findIndex(item => item.active === true);

            // get data from active item in queue
            const { id, timestamp }: IAudioPlayerQueueItem = this.getItemFromQueue(0);

            // load audio from queue to player, but do not play it
            this.setNewAudio(
                id || '',
                false,
                timestamp ? Math.floor(timestamp).toString() : '',
            );
        } else {
            console.warn('No queue in local storage');
            // if there is no queue in local storage, load random audio and initialize player with empty queue
            this.playerQueue = [];
        }
    };



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
        this.ui.thumbnail && this.ui.thumbnail.addEventListener('mouseenter', this.onCassetteMouseEnter);

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


        this.on(PlayerEvents.TIME_UPDATE, time => {
            Lightbox.isOpen && Lightbox.tryToUpdateTranscript(time);
        });


        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.checkOrientation();
            }, 150);
        });
    };



    private checkOrientation = (): void => {
        if (breakpoint.desktop) return;

        if (window.innerWidth > window.innerHeight && window.innerHeight < 550) {
            this.isHorizontalPhone = true;
            Lightbox.isOpen && this.minimize();
        } else {
            this.isHorizontalPhone = false;
            Lightbox.isOpen && this.expand();
        }

    };



    private onCassetteMouseEnter = (): void => {
        this.view.classList.add('is-mouseover');

        this.timeout = setTimeout(() => {
            this.view.classList.remove('is-mouseover');
        }, 1000);
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



    private setNewAudio = (id?: string, play?: boolean, startTime?: string, direction?: number, fromExternalBtn?: boolean): void => {
        this.animateOutIllustration(direction);
        this.elements.title.innerText = 'Loading...';
        this.isFetching = true;

        this.loadAudio(id)
            .then((data: IAudioPlayerResponse) => {
                this.updateQueue(fromExternalBtn, data.id, direction);
                this.animateOutCassette();
                this.updatePlayer(data);
                this.updateColors(data.color);
                Promise.all(
                    [breakpoint.desktop
                        ? null
                        : Images.preload(this.mobileIllustration.querySelectorAll('img'))],
                ).then(() => {
                    this.animateInIllustration(direction);
                    // eslint-disable-next-line max-len
                    this.setTitleInCassette(this.isPaused() ? `${AudioPlayerStatesText.PAUSED}: ${this.elements.title.innerText}` : `${AudioPlayerStatesText.PLAYING}: ${this.elements.title.innerText}`);

                    // check if lightbox is open and has the same id as audio player
                    Lightbox.checkPlayerState();

                    // at first load, check if URL has start time for audio
                    const hasParams = this.isInitialized ? false : this.seekToParams();
                    // play audio when it has been already initialized
                    if (play) {
                        !this.isExpanded && this.expand();
                        if (!hasParams) this.seekToTime(startTime ? parseInt(startTime, 10) : 0);
                        this.play();
                    } else if (startTime) {
                        this.seekToTime(parseInt(startTime, 10));
                    }
                    this.isInitialized = true;
                    this.isFetching = false;
                });
            });
    };



    private animateOutCassette = (): Promise<void> => new Promise(resolve => {
        gsap.to(this.cassetteEl, {
            yPercent: breakpoint.desktop ? 130 : this.isHorizontalPhone ? 130 : 0,
            xPercent: breakpoint.desktop ? 0 : this.isHorizontalPhone ? 0 : -130,
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



    private animateOutIllustration = (dir: number): void => {

        gsap.to(this.mobileIllustration, {
            x: dir * window.innerWidth,
            duration: 0.5,
            ease: 'power2.out',
        });
    };



    private animateInIllustration = (dir: number): void => {

        gsap.fromTo(this.mobileIllustration, { x: dir * (-window.innerWidth / 2) }, {
            x: 0,
            duration: 0.5,
            ease: 'power2.out',
            delay: this.isInitialized ? 0 : 0.5,
        });
    };



    private onNextClick = (): void => {
        if (this.isFetching) return;

        const { id, timestamp }: IAudioPlayerQueueItem = this.getItemFromQueue(1);
        this.setNewAudio(
            id || '',
            true,
            timestamp ? Math.floor(timestamp).toString() : '',
            1,
        );
    };



    private onPrevClick = (): void => {
        if (this.isFetching) return;

        const { id, timestamp }: IAudioPlayerQueueItem = this.getItemFromQueue(-1);
        this.setNewAudio(
            id || '',
            true,
            timestamp ? Math.floor(timestamp).toString() : '',
            -1,
        );
    };



    private onThumbnailClick = (): void => {
        // when lightbox is open, do not minimize the player - it should be always expanded
        if (Lightbox.isOpen) return;

        // if audio player is not initialized yet, load random audio
        if (!this.isInitialized) this.setNewAudio(undefined, true, '', 1);

        this.isExpanded ? this.minimize() : this.expand();
    };



    private onMinimizeClick = (): void => this.minimize();



    private minimize = (fast?: boolean): void => {
        // when lightbox is open, do not minimize the player - it should be always expanded
        if (Lightbox.isOpen && !this.isHorizontalPhone) return;

        this.view.classList.remove('is-expanded');
        document.body.classList.remove('has-audio-player-expanded');

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
        document.body.classList.add('has-audio-player-expanded');

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
        this.audioWrapper.innerHTML = data.src.map(src => `
            <audio src="${src.src}" data-duration="${src.duration}" preload="auto"></audio>
        `).join('');
        this.elements.title.innerText = data.title;
        // add modifier class for long titles
        this.elements.title.classList.toggle('player__title--long', data.title.length > 30);

        [...this.elements.urlLinks].forEach(link => {
            link.href = data.urlInterview;
        });
        this.mobileIllustration.querySelector('img').src = data.collectionImage.mobile_x2;
        this.elements.nextBtn.dataset.nextId = data.nextId?.toString() || '';
        this.elements.prevBtn.dataset.prevId = data.prevId?.toString() || '';


        // update Videos component
        this.setup();
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



    private updateQueue = (givenId: boolean, id: string, direction = 0): void => {

        // remove active flag from all items in queue
        // eslint-disable-next-line no-return-assign
        this.playerQueue.map(item => item.active = false);

        if (givenId) {
            // if id is from external button (directly run given interview, neither random nor from queue), remove all items after currently playing
            this.playerQueue.splice(this.activeQueueIndex + 1);
            // and set new item at the beginning of the queue
            this.playerQueue.push({ id, active: true });
        } else {
            const newActiveIndex = this.activeQueueIndex + direction;
            // the 'oldest' edge
            if (newActiveIndex < 0) {
                this.playerQueue.unshift({ id, active: true });
            } else if (newActiveIndex > this.playerQueue.length - 1) {
                this.playerQueue.push({ id, active: true });
            } else {
                this.playerQueue[newActiveIndex].active = true;
            }
        }


        // remove last(or first, depending on direction) item in queue if it exceeds the limit
        if (this.playerQueue.length > this.queueLimit) {
            direction === -1 ? this.playerQueue.pop() : this.playerQueue.shift();
        }


        this.activeQueueIndex = this.playerQueue.findIndex(item => item.active === true);
        local && console.table(this.playerQueue);

        this.saveQueueToStorage();
    };



    private updateQueueTimestamp = (): void => {
        this.playerQueue[this.activeQueueIndex].timestamp = this.media.currentTime;

        this.saveQueueToStorage();
    };



    private getItemFromQueue = (direction: number): IAudioPlayerQueueItem => {
        // find next/prev item in queue
        const newActiveIndex = this.activeQueueIndex + direction;

        // if there is no next/prev item in queue, return empty item and then draw random item to the player
        if (newActiveIndex < 0 || newActiveIndex > this.playerQueue.length - 1) {
            return { id: '', timestamp: 0, active: false };
        }

        return this.playerQueue[newActiveIndex];
    };



    private saveQueueToStorage = (): void => {
        const flattenedQueue = JSON.stringify(this.playerQueue);
        setStorageItem('audioQueue', flattenedQueue);
    };
}
