export class Share {
    constructor() {
        document.querySelectorAll('[data-share]').forEach(item => {
            item.addEventListener('click', this.onShareClick);
        });
    }


    private onShareClick = (e): boolean => {
        e.preventDefault();
        e.stopPropagation();

        let winWidth = 520;
        let winHeight = 350;
        let winTop = (window.screen.height / 2) - (winHeight / 2);
        const winLeft = (window.screen.width / 2) - (winWidth / 2);

        let { href } = e.currentTarget;
        const data = e.currentTarget.dataset.share;

        if (data === 'url') {
            href += encodeURIComponent(window.location.href);
        }

        if (data === 'linkedin') {
            winWidth = 420;
            winHeight = 430;
            winTop -= 100;
        }

        window.open(href, `sharer${data}`, `top=${winTop},left=${winLeft},toolbar=0,status=0,width=${winWidth},height=${winHeight}`);

        return false;
    };
}
