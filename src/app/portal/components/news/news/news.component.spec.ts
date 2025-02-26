import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NewsComponent } from './news.component';
import { SearchService } from 'src/app/portal/services/search.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { WINDOW_PROVIDERS } from 'src/app/shared/services/window.service';
import { ActivatedRouteStub } from 'src/testing/activated-route-stub';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AppConfigService } from 'src/app/shared/services/app-config-service.service';
import { AppConfigServiceMock } from 'src/app/portal/services/search.service.spec';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('NewsComponent', () => {
  let newsComponent: NewsComponent;
  let fixture: ComponentFixture<NewsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    schemas: [NO_ERRORS_SCHEMA],
    imports: [RouterTestingModule,
        MatDialogModule,
        NewsComponent],
    providers: [
        SearchService,
        { provide: ActivatedRoute, useValue: new ActivatedRouteStub() },
        { provide: AppConfigService, useClass: AppConfigServiceMock },
        provideAnimations(),
        WINDOW_PROVIDERS,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
});

    fixture = TestBed.createComponent(NewsComponent);
    newsComponent = fixture.componentInstance;
  });

  it('should be created', () => {
    expect(newsComponent).toBeDefined();
  });
});
