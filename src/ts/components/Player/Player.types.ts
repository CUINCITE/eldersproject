export class PlayerEvents {
    public static END = 'end';
    public static NEXT = 'next';
    public static PREV = 'prev';
    public static TIME_UPDATE = 'timeUpdate';
    public static PLAY = 'play';
    public static PAUSE = 'pause';
}


export class PlayerSize {
    public static COVER = 'cover';
    public static CONTAIN = 'contain';
    public static AUTO = 'auto';
}

export interface IPlayerSettings {
    pauseOnScroll: boolean;
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
    controls?: boolean;

    id?: string | number;
    src?: string;
    srcMobile?: string;
    poster?: string;
    posterMobile?: string;

    ratio?: number;
    ratioMobile?: number;
    width?: number;
    height?: number;
    size?: PlayerSize;

    timeFrom?: number;
    duration?: number;
    timeFormatLong?: boolean;
    cacheTime?: boolean;

    volume?: number;
    hotkeys?: boolean;
    readyTime?: number; // started class
    // tracking?: Array<ITrackingElem>;

    metadata?: MediaMetadata;
}


export interface ISpotData {
    el?: HTMLElement;
    id?: string;
    elHotspot?: HTMLElement;
    elLightbox?: HTMLElement;
    start?: number;
    stop?: number;
}

export interface IPlayerElements {
    duration?: HTMLElement;
    fullBtn?: HTMLElement;
    loaded?: HTMLElement;
    next?: HTMLElement;
    playBtn?: HTMLElement;
    playerBar?: HTMLElement;
    poster?: HTMLElement;
    prev?: HTMLElement;
    progress?: HTMLElement;
    scrubber?: HTMLElement;
    time?: HTMLElement;
    title?: HTMLElement;
    toggleBtn?: HTMLElement;
    volume?: HTMLElement;
    volumeBar?: HTMLElement;
    volumeButton?: HTMLElement;
    volumeValue?: HTMLElement;
    captions?: HTMLElement;
    cc?: HTMLElement;
    spots?: Array<ISpotData>;
    exitFullBtn?: HTMLButtonElement;
}
