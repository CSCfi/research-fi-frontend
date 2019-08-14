import { Component, OnInit, ViewChild, ElementRef, Injector, Input, ComponentRef } from '@angular/core';
import { ComponentPortal, DomPortalHost } from '@angular/cdk/portal';
import { createDomPortalHost } from './utils';
import { SearchService } from 'src/app/services/search.service';
import { HttpClient } from '@angular/common/http';

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
  data = {};

  constructor(readonly injector: Injector, private searchService: SearchService, private http: HttpClient) { }

  ngOnInit() {
    this.portalHost = createDomPortalHost(this.elRef, this.injector);
    const payload = {size: 10};
    this.http.get(this.searchService.apiUrl + 'funding/_search?size=10').subscribe(data => {
      this.data = data;
    });
  }

  onClickAddRandomChild() {
    const randomChild = ChildOne;
    const myPortal = new ComponentPortal(randomChild);
    this.portalHost.detach();
    const componentRef = this.portalHost.attach(myPortal);
    setTimeout(() => {
      console.log(this.data);
      componentRef.instance.fundingData = [this.data];
    }, 1);
  }
}

@Component({
  selector: 'app-child-one',
  templateUrl: '../fundings/fundings.component.html'
})
export class ChildOne {
  @Input() fundingData;
  expandStatus: Array<boolean> = [];
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
