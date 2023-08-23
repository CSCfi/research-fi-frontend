import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[dynamicChildLoader]',
})
export class DynamicChildLoaderDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}