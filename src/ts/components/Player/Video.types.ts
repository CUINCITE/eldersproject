// eslint-disable-next-line no-shadow
export enum MediaState {
    HAVE_NOTHING,
    HAVE_METADATA,
    HAVE_CURRENT_DATA,
    HAVE_FUTURE_DATA,
    HAVE_ENOUGH_DATA,
}



export class PlayerStorage {
    public static CC_ACTIVE: string = 'active';
    public static CC_INDEX: string = 'captions';
    public static CC_NOT_ACTIVE: string = 'not-active';
    public static CC: string = 'cc';
    public static SEEK: string = 'seek';
    public static SPEED: string = 'speed';
    public static VOLUME: string = 'volume';
}



export type PopupData = {
    url: string;
    session: number;
    timeStart: number;
    title: string;
    color: string;
    description: string;
    image: string;
    type: string;
    shown?: boolean;
    timeline?;
}
