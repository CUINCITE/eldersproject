import { Component } from './Component';

export class Canvas extends Component {
    private ctx: CanvasRenderingContext2D;
    private canvas: HTMLCanvasElement;
    private viewport = {
        width: 0,
        height: 0,
    };
    private pixelRatio = Math.min(2, Math.floor(window.devicePixelRatio || 1));
    private raf: number;
    private isAnimating = false;

    // eslint-disable-next-line no-unused-vars
    constructor(protected view: HTMLElement) {
        super(view);

        this.initCanvas();
    }


    public stop(): void {
        if (this.isAnimating) {
            this.isAnimating = false;
            window.cancelAnimationFrame(this.raf);
        }
    }


    public start(): void {
        if (!this.isAnimating) {
            this.isAnimating = true;
            this.loop();
        }
    }


    public draw(): void {
        this.ctx.clearRect(0, 0, this.canvas.width * this.pixelRatio, this.canvas.height * this.pixelRatio);
    }


    public resize = (wdt?: number, hgt?: number): void => {
        if (!this.canvas) {
            return;
        }
        this.viewport.width = wdt;
        this.viewport.height = hgt;
        this.canvas.width = this.viewport.width * this.pixelRatio;
        this.canvas.height = this.viewport.height * this.pixelRatio;
        this.canvas.style.width = `${this.viewport.width}px`;
        this.canvas.style.height = `${this.viewport.height}px`;
    };

    private loop = (): void => {
        this.draw();
        this.raf = window.requestAnimationFrame(this.loop);
    };


    private initCanvas(): void {
        this.viewport.width = window.innerWidth;
        this.viewport.height = window.innerHeight;
        this.canvas = this.view.querySelector('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = this.viewport.width * this.pixelRatio;
        this.canvas.height = this.viewport.height * this.pixelRatio;
        this.canvas.style.width = `${this.viewport.width}px`;
        this.canvas.style.height = `${this.viewport.height}px`;

        this.start();
    }
}
