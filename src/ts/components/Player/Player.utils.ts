export function decodeURL(src: string): string {
    const decode = (s): string => {
        try {
            const d = window.atob(s);
            return /^wq|x@$/g.test(d) ? d.replace(/^wq|x@$/g, '') : s;
        } catch (e) {
            return s;
        }
    };
    return /\.mp4$/.test(src) ? src : decode(src);
}



export function parseToTime(totalSeconds: number, isLong?: boolean): string {
    const totalSec = parseInt(`${totalSeconds}`, 10);
    const hours = parseInt(`${totalSec / 3600}`, 10) % 24;
    const minutes = parseInt(`${totalSec / 60}`, 10) % 60;
    const seconds = totalSec % 60;

    return `${(hours < 10 ? `0${hours}` : hours)}:${(minutes < 10 ? `0${minutes}` : minutes)}:${seconds < 10 ? `0${seconds}` : seconds}`;
}
