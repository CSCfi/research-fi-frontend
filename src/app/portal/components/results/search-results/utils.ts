//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  ElementRef,
  ComponentFactoryResolver,
  ApplicationRef,
  Injector,
} from '@angular/core';
import { DomPortalOutlet } from '@angular/cdk/portal';

export function createDomPortalOutlet(elRef: ElementRef, injector: Injector) {
  return new DomPortalOutlet(
    elRef.nativeElement,
    injector.get<ComponentFactoryResolver>(ComponentFactoryResolver as any),
    injector.get<ApplicationRef>(ApplicationRef as any),
    injector
  );
}
