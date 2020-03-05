import { Directive, Injectable, Input, EventEmitter, Output, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appScrollSpy]'
})
export class ScrollSpyDirective {
  @Input() public spiedTags = [];
  @Output() public sectionChange = new EventEmitter<number>();
  private currentSection: number;

  constructor(private el: ElementRef) {}

  @HostListener('window:scroll', ['$event']) onWindowScroll(event: any) {
    let currentSection: number;
    const children = this.el.nativeElement.children;
    const scrollTop = event.target.firstElementChild.scrollTop;
    const parentOffset = event.target.firstElementChild.offsetTop;
    // console.log(children);
    for (let i = 0; i < children.length; i++) {
        const element = children[i];
        if (this.spiedTags.some(spiedTag => spiedTag === element.tagName)) {
          if ((element.offsetTop - parentOffset) <= scrollTop) {
            currentSection = element.id;
          }
        }
    }
    // console.log(currentSection);
    if (currentSection !== this.currentSection) {
      this.currentSection = currentSection;
      this.sectionChange.emit(this.currentSection);
    }
  }

}
