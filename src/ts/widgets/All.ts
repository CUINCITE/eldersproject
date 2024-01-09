import { API } from './Api';
import { CSSAnimate } from './CSSAnimate';
import { Expand } from './Expand';
import { Images } from './Images';
import { Recaptcha } from './Recaptcha';

export default class Widgets {

    public static bind(): void {

        API.bind();
        CSSAnimate.bind();
        Expand.bind();
        Images.bind();
        Recaptcha.bind();
    }
}
