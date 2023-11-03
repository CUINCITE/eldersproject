/* eslint-disable no-param-reassign */
/* eslint-disable no-case-declarations */
import { PushStates } from '../PushStates';
import { Recaptcha } from './Recaptcha';
import { serializeObject } from '../Utils';

export interface IApiData {
    url?: string;
    beforeCall?: string;
    callback?: string;
    formSelector?: string;
    // tslint:disable-next-line: no-any
    params?: any;
    action?: 'POST' | 'DELETE' | 'GET' | 'PUT' | 'PATCH';
}

interface IApiElement extends HTMLElement {
    api: IApiData;
}


export class API {
    private static beforeCalls = {


        validate(data: IApiData, el: HTMLElement): void {
            let passed = true;
            let message = '';

            if (el.classList.contains('is-done')) {
                el.classList.remove('is-done');
                return;
            }

            el.querySelectorAll('.js-error').forEach(errorEl => {
                errorEl.innerHTML = '';
                errorEl.classList.remove('is-error');
            });


            el.querySelectorAll('input[required]:not([data-recaptcha])').forEach(input => {
                switch ((input as HTMLInputElement).type) {
                    case 'email':
                        // eslint-disable-next-line max-len
                        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                        const { value } = input as HTMLInputElement;


                        if (!re.test(value) || !value.length) {
                            passed = false;
                            input.parentElement.classList.add('is-error');
                            message = value.length > 0 ? "It seems there's an issue with the email you entered. <br> Please double-check and try again." : 'Required field';
                            input.closest('fieldset').querySelector('.js-error').innerHTML = message;
                        } else {
                            input.parentElement.classList.remove('is-error');
                            input.closest('fieldset').querySelector('.js-error').innerHTML = '';
                        }
                        break;

                    case 'password':
                        const pass = (input as HTMLInputElement).value;

                        if (pass.length > 5) {
                            input.parentElement.classList.remove('is-error');
                            input.parentElement.querySelector('.js-error').innerHTML = '';
                        } else {
                            passed = false;
                            input.parentElement.classList.add('is-error');
                            message = pass.length > 0 ? 'invalid-pass' : 'Required field';
                            input.parentElement.querySelector('.js-error').innerHTML = message;
                        }

                        break;

                    case 'checkbox':
                        if (!(input as HTMLInputElement).checked) {
                            passed = false;
                            input.parentElement.classList.add('is-error');
                            message = 'Required field';
                            input.parentElement.querySelector('.js-error').innerHTML = message;
                        } else {
                            input.parentElement.classList.remove('is-error');
                            input.parentElement.querySelector('.js-error').innerHTML = '';
                        }
                        break;

                    case 'text':
                        if ((input as HTMLInputElement).value.length > 0) {
                            input.parentElement.classList.remove('is-error');
                            input.parentElement.querySelector('.js-error').innerHTML = '';
                        } else {
                            passed = false;
                            input.parentElement.classList.add('is-error');
                            message = 'Required field';
                            input.parentElement.querySelector('.js-error').innerHTML = message;
                        }
                        break;

                    default:
                        break;
                }
            });

            el.querySelectorAll('textarea[required]').forEach(textarea => {
                if ((textarea as HTMLTextAreaElement).value.length > 0) {
                    textarea.parentElement.classList.remove('is-error');
                    textarea.parentElement.querySelector('.js-error').innerHTML = '';
                } else {
                    passed = false;
                    textarea.parentElement.classList.add('is-error');
                    message = 'Required field';
                    textarea.parentElement.querySelector('.js-error').innerHTML = message;
                }
            });


            if (passed) {
                Promise.all([Recaptcha ? Recaptcha.check(el as HTMLFormElement) : null]).then(() => {
                    API.callIt(data, el);
                    el.querySelectorAll('.js-error').forEach(errorEl => {
                        errorEl.innerHTML = '';
                        errorEl.classList.remove('is-error');
                    });
                    el.classList.remove('has-errors');
                });
            } else {
                el.classList.add('has-errors');
            }
        },

        validateBlur(data: IApiData, el: HTMLElement): void {
            let passed = true;
            let message = '';

            if (el.classList.contains('is-done')) {
                el.classList.remove('is-done');
                return;
            }

            el.querySelectorAll('.js-error').forEach(errorEl => {
                errorEl.innerHTML = '';
                errorEl.classList.remove('is-error');
            });


            el.querySelectorAll('input[required]:not([data-recaptcha])').forEach(input => {
                switch ((input as HTMLInputElement).type) {
                    case 'email':
                        // eslint-disable-next-line max-len
                        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                        const { value } = input as HTMLInputElement;


                        if (!re.test(value) || !value.length) {
                            passed = false;
                            input.parentElement.classList.add('is-error');
                            message = value.length > 0 ? 'NOT VALID E-MAIL FORMAT' : 'Required field';
                            input.closest('fieldset').querySelector('.js-error').innerHTML = message;
                        } else {
                            input.parentElement.classList.remove('is-error');
                            input.closest('fieldset').querySelector('.js-error').innerHTML = '';
                        }
                        break;

                    case 'password':
                        const pass = (input as HTMLInputElement).value;

                        if (pass.length > 5) {
                            input.parentElement.classList.remove('is-error');
                            input.parentElement.querySelector('.js-error').innerHTML = '';
                        } else {
                            passed = false;
                            input.parentElement.classList.add('is-error');
                            message = pass.length > 0 ? 'invalid-pass' : 'Required field';
                            input.parentElement.querySelector('.js-error').innerHTML = message;
                        }

                        break;

                    case 'checkbox':
                        if (!(input as HTMLInputElement).checked) {
                            passed = false;
                            input.parentElement.classList.add('is-error');
                            message = 'Required field';
                            input.parentElement.querySelector('.js-error').innerHTML = message;
                        } else {
                            input.parentElement.classList.remove('is-error');
                            input.parentElement.querySelector('.js-error').innerHTML = '';
                        }
                        break;

                    case 'text':
                        if ((input as HTMLInputElement).value.length > 0) {
                            input.parentElement.classList.remove('is-error');
                            input.parentElement.querySelector('.js-error').innerHTML = '';
                        } else {
                            passed = false;
                            input.parentElement.classList.add('is-error');
                            message = 'Required field';
                            input.parentElement.querySelector('.js-error').innerHTML = message;
                        }
                        break;

                    default:
                        break;
                }
            });

            el.querySelectorAll('textarea[required]').forEach(textarea => {
                if ((textarea as HTMLTextAreaElement).value.length > 0) {
                    textarea.parentElement.classList.remove('is-error');
                    textarea.parentElement.querySelector('.js-error').innerHTML = '';
                } else {
                    passed = false;
                    textarea.parentElement.classList.add('is-error');
                    message = 'Required field';
                    textarea.parentElement.querySelector('.js-error').innerHTML = message;
                }
            });


            if (passed) {
                el.querySelectorAll('.js-error').forEach(errorEl => {
                    errorEl.innerHTML = '';
                    errorEl.classList.remove('is-error');
                });
                el.classList.remove('has-errors');
            } else {
                el.classList.add('has-errors');
            }
        },

    };


    private static callbacks = {


        onSubscribe(data: IApiData, el: HTMLElement, response): void {
            let $message = el.querySelector('.js-message');

            if (!$message) {
                const div = document.createElement('div');
                div.classList.add('js-message', 'message');
                el.append(div);
                $message = el.querySelector('.js-message');
            }

            const html = (response.message);

            $message.innerHTML = html;

            el.classList.add('is-completed');

            el.querySelectorAll('input').forEach(elem => elem.dispatchEvent(new Event('blur')));
        },

        onSendMessage(data: IApiData, el: HTMLElement, response): void {
            let $message = el.querySelector('.js-message');

            if (!$message) {
                el.append('<div class="js-message message">');
                $message = el.querySelector('.js-message');
            }

            const html = (response.message);

            $message.innerHTML = html;

            el.classList.add('is-completed');

            el.querySelectorAll('input').forEach(elem => elem.dispatchEvent(new Event('blur')));
        },

        reload: (): void => {
            PushStates.reload();
        },
    };


    public static bind(): void {
        if (document.querySelectorAll('[data-api]:not(form)')) {
            document.querySelectorAll('[data-api]:not(form)').forEach(apiEl => {
                apiEl.removeEventListener('click', API.onAction);
                apiEl.addEventListener('click', API.onAction);
            });
        }

        if (document.querySelectorAll('form[data-api]')) {
            document.querySelectorAll('form[data-api]').forEach(apiFormEl => {
                apiFormEl.removeEventListener('submit', API.onAction);
                apiFormEl.addEventListener('submit', API.onAction);
                apiFormEl.setAttribute('novalidate', 'novalidate');

                apiFormEl.querySelectorAll('input[required').forEach(input => {
                    input.addEventListener('blur', () => {
                        const data: IApiData = { ...JSON.parse(apiFormEl.getAttribute('data-api')) };
                        API.beforeCalls.validateBlur(data, apiFormEl as HTMLElement);
                    });
                });
            });
        }
    }


    public static callIt(dataApi: IApiData, el: HTMLElement, customCallback?: Function): Promise<any> {
        const data = API.preprocessData(dataApi, el);

        el.classList.add('is-doing-request');

        const action = data.action || 'POST';
        delete data.action;

        const url = data.url || window.location.pathname;
        delete data.url;

        return new Promise<any>((resolve, reject) => {
            el.classList.remove('is-doing-request');

            const dataBody = new URLSearchParams(data as any);

            fetch(url, {
                method: action,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: dataBody,
            })
                .then(response => response.json())
                .then(response => {
                    if (data.callback) {
                        API.onSuccess(data, el, response);
                    }

                    if (customCallback && typeof customCallback === 'function') {
                        customCallback(data, el, response);
                    }

                    resolve(response);
                })
                .catch(error => {
                    console.warn(`API error: ${error}`, data);
                    reject(error);
                });
        });
    }


    private static preprocessData(data: IApiData, el: HTMLElement): IApiData {
        // get data if api called on form element:
        if (el.matches('form')) {
            data.url = !data.url && el.getAttribute('action') ? el.getAttribute('action') : data.url;
            data = Object.assign(data, serializeObject(el as HTMLFormElement));
        }

        // update data if api called on link element:
        if (el.matches('[href]')) {
            data.url = !data.url && el.getAttribute('href') ? el.getAttribute('href') : data.url;
        }

        // get additional data from external form:
        if (data.formSelector) {
            data = Object.assign(data, serializeObject(document.querySelector(data.formSelector)));
            delete data.formSelector;
        }

        // flatten:
        if (data.params) {
            data = Object.assign(data, data.params);
            delete data.params;
        }

        return data;
    }


    private static onAction = (e: Event): void => {
        e.preventDefault();
        e.stopPropagation();

        const el = e.currentTarget as IApiElement;
        const data: IApiData = { ...JSON.parse(el.getAttribute('data-api')) };
        // console.log(data, el);

        // beforeCall handler:
        if (data.beforeCall) {
            if (data.beforeCall in API.beforeCalls) {
                API.beforeCalls[data.beforeCall](data, el);
                return;
            }
        }

        API.callIt(data, el);
    };


    private static onSuccess = (data: IApiData, el: HTMLElement, response): void => {
        if (data.callback) {
            if (data.callback in API.callbacks) {
                API.callbacks[data.callback](data, el, response);
            }
        }
    };


    public static refresh = () => {
        const forms = [...document.querySelectorAll('form')];

        forms.forEach(form => {
            const inputs = form.querySelectorAll('input');
            const errors = [...form.querySelectorAll('.is-error'), ...form.querySelectorAll('.has-errors')];
            const errorMessages = form.querySelectorAll('.js-error');
            form.classList.remove('is-doing-request', 'is-completed', 'has-errors');


            // eslint-disable-next-line no-restricted-syntax
            for (const message of errorMessages) {
                message.innerHTML = '';
            }

            // eslint-disable-next-line no-restricted-syntax
            for (const input of inputs) {
                input.value = '';
            }

            // eslint-disable-next-line no-restricted-syntax
            for (const err of errors) {
                err.classList.remove('is-error', 'has-errors');
            }
        });
    };
}
