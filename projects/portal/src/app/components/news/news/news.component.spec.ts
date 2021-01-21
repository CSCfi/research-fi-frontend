import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NewsComponent } from './news.component';
import { SearchService } from '@portal.services/search.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { WINDOW_PROVIDERS } from '@portal.services/window.service';
import { ActivatedRouteStub } from '@portal.testing/activated-route-stub';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppConfigService } from '@portal.services/app-config-service.service';
import { AppConfigServiceMock } from '@portal.services/search.service.spec';
import { ModalModule } from 'ngx-bootstrap';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('NewsComponent', () => {
  let newsComponent: NewsComponent;
  let fixture: ComponentFixture<NewsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NewsComponent],
      providers: [
        SearchService,
        { provide: ActivatedRoute, useValue: new ActivatedRouteStub() },
        { provide: AppConfigService, useClass: AppConfigServiceMock },
        WINDOW_PROVIDERS,
      ],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        ModalModule.forRoot(),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(NewsComponent);
    newsComponent = fixture.componentInstance;
  });

  it('should be created', () => {
    expect(newsComponent).toBeDefined();
  });
});
