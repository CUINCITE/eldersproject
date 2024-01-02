import { API } from './Api';
import { CSSAnimate } from './CSSAnimate';
import { Expand } from './Expand';

export default class Widgets {

    public static bind(): void {
        API.bind();
        CSSAnimate.bind();
        Expand.bind();
    }
}
