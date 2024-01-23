export class Vibration {


    public static bind(where?: HTMLElement): void {
        [...(where || document).querySelectorAll('a, label, button')].forEach(el => {
            el.addEventListener('click', Vibration.onClick);
        });
    }


    private static onClick = e => {
        navigator.vibrate(5);
    };
}
