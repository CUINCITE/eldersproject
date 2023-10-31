/* eslint-disable no-undef */
/// <reference path="../definitions/grecaptcha.d.ts" />

import { getScript } from '../Utils';


export class Recaptcha {
    private static SITE_KEY: string;
    private static inputSelector = '[data-recaptcha]';


    public static bind(selector?: any): void {
        let target = typeof selector === 'undefined' ? document.body : selector;

        if (!document.querySelector('[data-recaptchakey]')) { return; }

        Recaptcha.SITE_KEY = Recaptcha.SITE_KEY
        || (document.querySelector('[data-recaptchakey]') as HTMLElement).dataset.recaptchakey;

        if (!target.querySelector(Recaptcha.inputSelector)) { return; }

        if (typeof grecaptcha === 'undefined') {
            getScript(
                `//www.google.com/recaptcha/api.js?render=${Recaptcha.SITE_KEY}`,
                () => Recaptcha.attach(target.querySelector(Recaptcha.inputSelector))
            );
        } else {
            Recaptcha.attach(target.querySelector(Recaptcha.inputSelector));
        }
    }


    // linked with `Widgets.Form`
    public static check(form: HTMLFormElement): Promise<string> {
        return new Promise<string>(resolve => {
            const action = form.getAttribute('action').split('/').pop().replace(/[^0-9a-z]/gi, '') || 'action';
            grecaptcha.execute(Recaptcha.SITE_KEY, { action })
                .then(token => {
                    Recaptcha.onExecute(form, token);
                    resolve(token);
                });
        });
    }


    private static attach(target: HTMLElement): void {
        grecaptcha.ready(() => {
            target.closest('form').data = { Recaptcha };
            target.closest('form').classList.add('has-recaptcha');
        });
    }


    private static onExecute(form: HTMLFormElement, token: string): void {
        if (!form.querySelector('[name=token]')) { form.append('<input name="token" type="hidden" value="">'); }
        const input = form.querySelector('[name=token]') as HTMLInputElement;
        input.value = token;
    }
}
