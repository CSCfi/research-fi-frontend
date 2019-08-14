import { ElementRef, ComponentFactoryResolver, ApplicationRef, Injector } from '@angular/core';
import { DomPortalHost } from '@angular/cdk/portal';


export function createDomPortalHost(elRef: ElementRef, injector: Injector) {
  return new DomPortalHost(
    elRef.nativeElement,
    injector.get(ComponentFactoryResolver),
    injector.get(ApplicationRef),
    injector
  );
}