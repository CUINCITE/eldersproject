import { parseToTime } from './Player.utils';

export class PlayerTime {


    private durationTimeEl: HTMLElement;
    private currentTimeEl: HTMLElement;



    constructor(playerEl: HTMLElement) {
        this.currentTimeEl = playerEl.querySelector('.js-player-time');
        this.durationTimeEl = playerEl.querySelector('.js-player-duration');
    }



    public destroy(): void {
        this.currentTimeEl = null;
        this.durationTimeEl = null;
    }



    public update(metadata: { duration: number, current?: number }, isLong?: boolean): void {
        if (this.durationTimeEl) {
            this.durationTimeEl.innerText = parseToTime(metadata.duration, isLong);
        }
        if (this.currentTimeEl && typeof metadata.current === 'number') {
            this.currentTimeEl.innerText = parseToTime(metadata.current || 0, isLong);
        }
    }
}
