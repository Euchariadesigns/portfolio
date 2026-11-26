// The flip-book library Strata uses ships without types; just what we call.
declare module "page-flip/dist/js/page-flip.module.js" {
  export class PageFlip {
    constructor(el: HTMLElement, settings: Record<string, unknown>);
    loadFromImages(images: string[]): void;
    flipNext(corner?: "top" | "bottom"): void;
    flipPrev(corner?: "top" | "bottom"): void;
    turnToPage(page: number): void;
    destroy(): void;
  }
}
