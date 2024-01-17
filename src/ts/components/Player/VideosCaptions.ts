import { setStorageItem } from '../../Utils';
import { VideoCaptions } from './VideoCaptions';
import { PlayerStorage } from './Video.types';

export class VideosCaptions extends VideoCaptions {



    constructor(protected view: HTMLElement, protected playerEl: HTMLElement, private medias: HTMLMediaElement[]) {
        super(view, playerEl);
        this.medias = medias;
    }



    public load(medias: HTMLMediaElement[]): void {
        const tracks = [];
        medias.forEach(media => {
            if (media.textTracks.length > 0) {
                tracks.push(media.textTracks);
                [...media.textTracks].forEach((track: TextTrack) => { track.mode = 'hidden'; });
            } else {
                tracks.push(null);
            }
        });

        const amount = tracks.filter(Boolean).length;
        this.playerEl.classList.toggle('has-cc', amount > 0);
        this.tracks = amount ? tracks : null;

        this.checkLocalStorage();
    }



    public showNative(): void {
        this.tracks && [...this.tracks].forEach((tracklist: TextTrackList) => {
            [...tracklist].forEach((track: TextTrack) => {
                (track.mode === 'hidden') && (track.mode = 'showing');
            });
        });
    }



    public hideNative(): void {
        this.tracks && [...this.tracks].forEach((tracklist: TextTrackList) => {
            [...tracklist].forEach((track: TextTrack) => {
                (track.mode === 'showing') && (track.mode = 'hidden');
            });
        });
    }



    protected loadCC(index: number): void {

        if (!Array.isArray(this.tracks)) { return; }

        this.isActive = true;
        this.currentIndex = index;

        setStorageItem(PlayerStorage.CC_INDEX, `${index}`);

        this.tracks && [...this.tracks].forEach(tracklist => this.loadTracklist(tracklist));
        this.updateButtons();
    }
}
