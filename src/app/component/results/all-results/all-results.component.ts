import { Component, OnInit, ViewChild, ElementRef, Injector, Input, ComponentRef } from '@angular/core';
import { ComponentPortal, DomPortalHost } from '@angular/cdk/portal';
import { createDomPortalHost } from './utils';

@Component({
  selector: 'app-all-results',
  template: `
  <button (click)="onClickAddRandomChild()">Click to add random child component</button>
  <div #portalHost></div>
`
})
export class AllResultsComponent implements OnInit {

  portalHost: DomPortalHost;
  @ViewChild('portalHost') elRef: ElementRef;
  components = [ChildOne, ChildTwo, ChildThree];

  constructor(readonly injector: Injector) { }

  ngOnInit() {
    this.portalHost = createDomPortalHost(this.elRef, this.injector);
  }

  onClickAddRandomChild() {
    const randomChild = this.components[Math.floor(Math.random() * this.components.length)];
    const myPortal = new ComponentPortal(randomChild);
    this.portalHost.detach()
    const componentRef = this.portalHost.attach(myPortal);
    setTimeout(() => {
      componentRef.instance.myInput = 'hello';
    }, 1);
  }
}

@Component({
  selector: 'app-child-one',
  template: `<p>I am child one. <strong>{{myInput}}</strong></p>`
})
export class ChildOne {
  @Input() myInput = '';
}

@Component({
  selector: 'app-child-two',
  template: `<p>I am child two. <strong>{{myInput}}</strong></p>`
})
export class ChildTwo {
  @Input() myInput = '';
}

@Component({
  selector: 'app-child-three',
  template: `<p>I am child three. <strong>{{myInput}}</strong></p>`
})
export class ChildThree {
  @Input() myInput = '';
}
