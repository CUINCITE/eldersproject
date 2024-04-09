import { browser } from '../../Site';
import { IPlayerSettings } from './Player.types';

export class PlayerPoster {


    constructor(private view: HTMLElement, private playerEl: HTMLElement) {
        this.view = view;
        this.playerEl = playerEl;
    }



    public load(data: IPlayerSettings): void {
        if (data.poster) {
            const poster = !!browser.mobile
                && data.posterMobile
                && data.posterMobile !== ''
                ? data.posterMobile
                : data.poster;

            this.view.style.backgroundImage = `url(${poster})`;
        }

        this.playerEl.classList.toggle('has-poster', !!data.poster);
    }
}
