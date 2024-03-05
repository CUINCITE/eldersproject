import { debug } from '../Site';
import { Analytics } from './Analytics';

export class Accessibility {


    public static tabbedAmunt = 0;
    public static current: { el: HTMLElement; callback: Function };
    public static isOn: boolean;


    public static init(): void {
        const html = document.documentElement;

        document.addEventListener('keyup', e => {
            const key = e.keyCode || e.which;
            if (key === 9) {
                Accessibility.tabbedAmunt += 1;
                if (debug) { console.log('%caccessibility', 'background: yellow; color: black', document.activeElement); }
                html.classList.toggle('accessibility', Accessibility.tabbedAmunt >= 2);
                Accessibility.tabbedAmunt >= 2 && !Accessibility.isOn && Analytics.sendCustomEvent({ event: 'accessibility_on' });
                Accessibility.isOn = html.classList.contains('accessibility');
            }
        });

        document.addEventListener('mouseup', e => {
            if (e.detail) {
                html.classList.remove('accessibility');
                Accessibility.tabbedAmunt = 0;
                Accessibility.isOn = html.classList.contains('accessibility');
            }
        });



        document.querySelectorAll('[data-skip-to]').forEach(item => {
            item.addEventListener('click', e => {
                e.preventDefault();
                e.stopPropagation();

                const target = (e.currentTarget as HTMLElement).getAttribute('href');
                if (!target[0]) { return; }
                (document.querySelector(`${target} a`) as HTMLElement).focus();

                html.classList.add('accessibility');
            });
        });
    }
}
