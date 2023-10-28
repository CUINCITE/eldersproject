export interface IBreakpoint {
    desktop: boolean;
    tablet: boolean;
    phone: boolean;
    value: string;
}


export function getBreakpoint(): IBreakpoint {
    const before = window.getComputedStyle(document.querySelector('body'), ':before');
    const breakpoint = before.getPropertyValue('content').replace(/[\"\']/g, '');

    return {
        desktop: breakpoint === 'desktop',
        phone: breakpoint === 'phone',
        tablet: breakpoint === 'tablet',
        value: breakpoint,
    };
}
