import { Handler } from '../Handler';
import { generateUID } from '../Utils';

export class ComponentEvents {
    public static readonly CHANGE: string = 'change';
}


export abstract class Component extends Handler {
    public uuid: string;

    constructor(protected view: HTMLElement) {
        super();
        this.uuid = generateUID();
        if (!view) { console.warn('component built without view'); }
    }

    public onState(): boolean {
        return false;
    }

    // eslint-disable-next-line no-unused-vars
    public animateIn(index?: number, delay?: number): void { }

    public animateOut(): Promise<void> {
        // if you don't want to animate component,
        // just return empty Promise:
        return Promise.resolve(null);
    }

    // eslint-disable-next-line no-unused-vars
    public resize = (wdt: number, hgt: number): void => { };

    public destroy(): void {
        super.destroy();
    }
}
