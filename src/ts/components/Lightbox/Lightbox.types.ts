export type LightboxData = {
    url?: string;
    modifier?: string;
    image?: {
        desktop: string;
        mobile: string;
    },
    title?: string;
    collection?: string;
    text?: string;
    tags?: string[];
    state?: string;
    transcript?: {
        english?: [time: number, text: string];
        spanish?: [time: number, text: string];
    }
    info?: string;
    downloads?: [{
        url: string;
        name: string;
        ext: string;
        filename: string
    }],
    related?: [{
        url: string
        title: string;
        collection: string;
        text: string;
    }]
}
