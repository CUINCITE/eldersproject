/* eslint-disable no-undef */
/// <reference path="../definitions/twig.d.ts" />

// eslint-disable-next-line max-classes-per-file
export class TemplateNames {
    public static LIGHTBOX = 'lightbox';
    public static LIVESEARCH = 'livesearch';
    public static PLAYER = 'player';
}

export class Templates {
    public static get(name: string): Twig.Template {
        const tmpl = document.querySelector(`#tmpl-${name}`);
        if (!tmpl) {
            console.warn('There is no `%s` template!', name);
            return null;
        }
        return Twig.twig({ data: tmpl.innerHTML });
    }
}
