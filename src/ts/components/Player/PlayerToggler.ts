/* export class PlayerToggler {

    constructor() {}



    private bind(): void {
        if (this.controls) {
            this.controls.toggleBtn && this.controls.toggleBtn.addEventListener('click', this.onToggleClick);
        }
    }



    private unbind(): {
        if (this.controls) {
            this.controls.toggleBtn && this.controls.toggleBtn.removeEventListener('click', this.onToggleClick);
        }
    }



    protected onToggleClick = (e): void => {
        e.preventDefault();
        e.stopPropagation();
        if (!this.toggle()) {
            this.userPaused = true;
        }
    };
}
*/
