import { getBrowser } from '../Browser';
import { Sound } from './Sound';

export class Sounds {

    private static root: string = '/public/theme/sounds/';
    private static canPlay: boolean = false; // Sounds.supportsAudio();
    private static muted: boolean = false;
    private static sources = {
        click: 'tick_silent.mp3',
        playerBtn: '627848__francoistjp__rew-musique-stop-off_02_silent.mp3',
        playerRewind: '627848__francoistjp__rew-musique-stop-off_01_silent.mp3',
        playerRewinding: '627848__francoistjp__rew-musique-stop-off_01_crop_silent.mp3',
    };

    private static sounds: { [key: string]: Sound };



    public static supportsAudio(): boolean {
        return !!(window.AudioContext
            || (window as any).webkitAudioContext
            || (window as any).mozAudioContext
            || (window as any).oAudioContext
            || (window as any).msAudioContext) && !getBrowser().phone;
    }



    public static init(): void {
        if (!Sounds.canPlay) { return; }

        Object.entries(Sounds.sources).forEach(([key, value]) => {
            Sounds.sounds[key] = new Sound(Sounds.root + value);
            Sounds.sounds[key].load();
        });
    }



    public static bind(where?: HTMLElement): void {

        if (!Sounds.canPlay) { return; }

        if (!Sounds.sounds) {
            Sounds.sounds = {};
            Sounds.init();
        }

        [...(where || document).querySelectorAll('[data-sound-hover]')].forEach(el => {
            el.addEventListener('mouseenter', e => {
                const type = (e.currentTarget as HTMLElement).dataset.soundHover || 'hover';
                Sounds.play(type);
            });
        });

        [...(where || document).querySelectorAll('[data-sound-click]')].forEach(el => {
            el.addEventListener('click', e => {
                const type = (e.currentTarget as HTMLElement).dataset.soundClick || 'click';
                Sounds.play(type);
            });
        });

        document.querySelectorAll('[data-generate-sounds]')
            .forEach(el => el.addEventListener('click', e => Sounds.generateSoundTester(e)));

        document.querySelectorAll('.js-toggle-sounds')
            .forEach(el => el.addEventListener('click', e => {
                e.preventDefault();
                e.stopPropagation();
                Sounds.toggle();
            }));
    }



    public static toggle(): void {
        Sounds.muted = !Sounds.muted;
        document.body.classList.toggle('is-muted', Sounds.muted);
    }



    public static play(type: string): Promise<void> {
        if (Sounds.muted || !Sounds.canPlay || !Sounds.sounds[type]) { return Promise.resolve(); }
        return Sounds.sounds[type].play();
    }



    private static generateSoundTester(e): void {
        let html = '<ul>';
        Object.keys(Sounds.sources).forEach(property => {
            html += `<li class="sound-test" data-sound-click="${property}"><strong>${property}</strong> ${Sounds.sources[property]}</li>`;
        });
        html += '</ul>';
        e.currentTarget.style.display = 'none';
        e.currentTarget.insertAdjacentHTML('afterend', html);
        Sounds.bind(e.currentTarget.parentNode);
    }
}
