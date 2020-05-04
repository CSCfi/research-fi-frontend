import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchBarComponent } from "./search-bar.component";
// import { ElementRef, Inject } from '@angular/core';
// import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { SearchService } from '../../services/search.service';
import { HttpClientTestingModule } from '@angular/common/http/testing'
// import { SortService } from '../../services/sort.service';
// import { AutosuggestService } from '../../services/autosuggest.service';
// import { TabChangeService } from '../../services/tab-change.service';
import { Router, ActivatedRoute } from '@angular/router';
// import { SingleItemService } from '../../services/single-item.service';
import { AppConfigService } from '../../services/app-config-service.service';

import {
    ActivatedRouteStub
} from '../../../testing/activated-route-stub';

const mockApiUrl = 'test.api.fi/'

export class AppConfigServiceMock {
  get apiUrl() {
      return mockApiUrl;
  }
}

describe('SearchBarComponent', () => {
    it('should create', () => {
        let activatedRoute: ActivatedRouteStub;

        activatedRoute = new ActivatedRouteStub()

        TestBed.configureTestingModule({
            declarations: [ SearchBarComponent ],
            providers: [
                SearchService,
                Router,
                //ActivatedRoute,
                { provide: AppConfigService, useClass: AppConfigServiceMock},
                { provide: ActivatedRoute, useValue: activatedRoute },
            ],
            imports: [
                HttpClientTestingModule,
                //HttpTestingController
            ]
        });

        const fixture = TestBed.createComponent(SearchBarComponent);
        const component = fixture.componentInstance;
        expect(component).toBeDefined();
    });
});