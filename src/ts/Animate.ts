import { animations } from './animations/all';

export type AnimationType = (el: HTMLElement, delay?: number) => gsap.core.Tween | gsap.core.Timeline;


export function getAnimation(type: string, el: HTMLElement, delay: number): gsap.core.Tween | gsap.core.Timeline | null {
    if (!animations[type]) { console.warn(`animation type "${type}" does not exist`); return null; }
    return animations[type]?.(el, delay);
}
