import { Accessibility } from './Accessibility';
import { Analytics } from './Analytics';
import { API } from './Api';
import { CSSAnimate } from './CSSAnimate';
import { Expand } from './Expand';
import { Images } from './Images';
import { Recaptcha } from './Recaptcha';
import { Sounds } from './Sounds';
import { Vibration } from './Vibration';

export default class Widgets {

    public static bind(el?: HTMLElement): void {

        Accessibility.init();
        Analytics.bind(el);
        API.bind(el);
        CSSAnimate.bind(el);
        Expand.bind(el);
        Images.bind(el);
        Recaptcha.bind(el);
        Sounds.bind(el);
        Vibration.bind(el);

    }
}
