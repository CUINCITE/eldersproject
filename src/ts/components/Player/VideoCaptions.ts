import { getStorageItem, setStorageItem } from '../../Utils';
import { PlayerStorage } from './Video.types';


export class VideoCaptions {


    protected tracks: TextTrackList | TextTrackList[];
    protected currentIndex: number;
    protected isActive: boolean;
    private captions: HTMLElement;
    private btn: HTMLButtonElement;
    private listButtons: HTMLLIElement[];
    private timeout: ReturnType<typeof setTimeout>;



    constructor(protected view: HTMLElement, protected playerEl: HTMLElement) {
        this.view = view;
        this.playerEl = playerEl;
        this.btn = view.querySelector('.js-player-cc-btn');
        this.captions = playerEl.querySelector('.js-player-cc-text');
        this.listButtons = [...view.querySelectorAll('.js-player-cc-item')] as HTMLLIElement[];

        this.bind();
    }



    public destroy(): void {
        this.unbind();
        this.view = null;
        this.playerEl = null;
        this.btn = null;
        this.captions = null;
        this.listButtons = null;
        this.unloadCC();
        this.tracks = null;
        this.currentIndex = null;
    }



    public load(media: HTMLMediaElement | HTMLMediaElement[]): void {
        if (!Array.isArray(media) && media.textTracks.length > 0) {
            this.playerEl.classList.add('has-cc');
            this.tracks = media.textTracks;
            [...this.tracks].forEach((track: TextTrack) => { track.mode = 'hidden'; });
        } else {
            this.playerEl.classList.remove('has-cc');
        }

        this.checkLocalStorage();
    }



    public toggle(): void {
        this.isActive = !this.isActive;
        setStorageItem(PlayerStorage.CC, this.isActive ? PlayerStorage.CC_ACTIVE : PlayerStorage.CC_NOT_ACTIVE);

        if (this.isActive) {
            this.loadCC(this.currentIndex >= 0 ? this.currentIndex : 0);
        } else {
            this.unloadCC();
        }

        this.view.classList.add('is-updating');
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => this.view.classList.remove('is-updating'), (600 + 300));
    }



    public showNative(): void {
        this.tracks && [...this.tracks].forEach((track: TextTrack) => {
            track.mode = track.mode === 'hidden' ? 'showing' : 'disabled';
        });
    }



    public hideNative(): void {
        this.tracks && [...this.tracks].forEach((track: TextTrack) => {
            track.mode = track.mode === 'showing' ? 'hidden' : 'disabled';
        });
    }



    protected loadCC(index: number): void {

        if (Array.isArray(this.tracks)) { return; }

        this.isActive = true;
        this.currentIndex = index;

        setStorageItem(PlayerStorage.CC_INDEX, `${index}`);
        setStorageItem(PlayerStorage.CC, PlayerStorage.CC_ACTIVE);

        this.loadTracklist(this.tracks);
        this.updateButtons();
    }



    protected loadTracklist(tracklist: TextTrackList): void {
        if (!tracklist) { return; }

        [...tracklist].forEach((track: TextTrack, i: number) => {
            track.mode = i === this.currentIndex ? 'hidden' : 'disabled';
        });

        const track = tracklist[this.currentIndex];
        const { cues } = track;

        for (let i = 0; i < cues.length; ++i) {
            const cue: VTTCue = cues[i] as VTTCue;
            cue.onenter = this.onCueEnter;
            cue.onexit = this.onCueExit;
        }
    }



    protected unloadCC(): void {
        this.isActive = false;
        this.tracks && [...this.tracks].forEach((track: TextTrack) => { track.mode = 'disabled'; });
        this.updateButtons();
        setStorageItem(PlayerStorage.CC, PlayerStorage.CC_NOT_ACTIVE);
    }



    protected updateButtons(): void {
        this.listButtons.forEach((btn, i) => {
            const isCurrent = (!this.isActive && i === 0) || (this.isActive && i - 1 === this.currentIndex);
            btn.parentElement.classList.toggle('is-active', isCurrent);
        });
        this.playerEl.classList.toggle('has-captions-on', this.isActive);
    }



    protected onCueEnter = (e: Event): any => {
        this.captions && (this.captions.style.display = 'block');
        this.captions && (this.captions.innerHTML = `<span>${(e.currentTarget as VTTCue).text}</span>`);
    };



    protected onCueExit = () => {
        this.captions && (this.captions.style.display = 'none');
    };



    protected checkLocalStorage(): void {
        if (getStorageItem(PlayerStorage.CC) === PlayerStorage.CC_ACTIVE) {
            this.loadCC(parseInt(PlayerStorage.CC_INDEX, 10) || 0);
        }
    }



    private bind(): void {
        this.btn?.addEventListener('click', this.onToggleBtnClick);
        this.listButtons?.forEach(btn => btn.addEventListener('click', this.onCCTrackClick));
    }



    private unbind(): void {
        this.btn?.removeEventListener('click', this.onToggleBtnClick);
        this.listButtons?.forEach(btn => btn.removeEventListener('click', this.onCCTrackClick));
    }



    private onToggleBtnClick = (e): void => {
        e.stopPropagation();
        this.toggle();
    };



    private onCCTrackClick = e => {
        e.preventDefault();
        e.stopPropagation();
        const index = parseInt(e.currentTarget.dataset.index || -1, 10);
        index < 0 ? this.unloadCC() : this.loadCC(index);
    };
}
