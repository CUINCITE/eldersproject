import { Handler } from '../../Handler';


export class PlayerSettingsEvents {
    public static SPEED: string = 'speed';
}


export class PlayerSettings extends Handler {

    public static MAX_SPEED = 2;
    public static MIN_SPEED = 0.25;
    public static SPEED_STEP = 0.25;

    public static constrainSpeed(speed: number): number {
        return Math.max(PlayerSettings.MIN_SPEED, Math.min(PlayerSettings.MAX_SPEED, speed));
    }


    private listButtons: Array<HTMLLIElement>;
    private timeout: ReturnType<typeof setTimeout>;
    private isInitialSetup: boolean = true;
    private button: HTMLButtonElement;



    constructor(protected view: HTMLElement, protected playerEl: HTMLElement) {
        super();

        this.view = view;
        this.playerEl = playerEl;
        this.listButtons = [...view.querySelectorAll('[data-playback-rate]')] as HTMLLIElement[];

        this.bind();
    }



    public destroy(): void {
        this.unbind();
        this.view = null;
        this.playerEl = null;
        this.listButtons = null;
    }



    public updateSpeed(speed: number): void {
        if (!this.isInitialSetup) {
            this.view.classList.add('is-updating');
            clearTimeout(this.timeout);
            this.timeout = setTimeout(() => this.view.classList.remove('is-updating'), (600 + 300));
        }
        this.isInitialSetup = false;

        this.listButtons.forEach(btn => {
            btn.parentElement.classList.toggle('is-active', parseFloat(btn.dataset.playbackRate) === speed);
        });
    }



    private bind(): void {
        this.listButtons.forEach(btn => btn.addEventListener('click', this.onSpeedBtnClick));
    }



    private unbind(): void {
        this.listButtons.forEach(btn => btn.removeEventListener('click', this.onSpeedBtnClick));
    }



    private onSpeedBtnClick = (e: MouseEvent) => {
        this.trigger(PlayerSettingsEvents.SPEED, parseFloat((e.currentTarget as HTMLElement).dataset.playbackRate));
    };
}
