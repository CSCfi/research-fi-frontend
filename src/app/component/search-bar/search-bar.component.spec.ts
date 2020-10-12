import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { SearchService } from 'src/app/services/search.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { WINDOW_PROVIDERS } from 'src/app/services/window.service';
import { ActivatedRouteStub } from 'src/testing/activated-route-stub';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppConfigService } from 'src/app/services/app-config-service.service';
import { AppConfigServiceMock } from 'src/app/services/search.service.spec';
import { ModalModule } from 'ngx-bootstrap';
import { NO_ERRORS_SCHEMA, QueryList } from '@angular/core';
import { SearchBarComponent } from './search-bar.component';
import { AutosuggestService } from 'src/app/services/autosuggest.service';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { aggregations, hits, suggest } from 'src/testdata/autosuggest-response.json';

describe('SearchBarComponent', () => {
    let searchBarComponent: SearchBarComponent;
    let fixture: ComponentFixture<SearchBarComponent>;
    let autoSuggestService: AutosuggestService;
    let activatedRouteStub: ActivatedRoute;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [SearchBarComponent],
            providers: [
                SearchService,
                AutosuggestService,
                {provide: ActivatedRoute, useValue: new ActivatedRouteStub()},
                {provide: AppConfigService, useClass: AppConfigServiceMock},
                WINDOW_PROVIDERS,
            ],
            imports: [HttpClientTestingModule, RouterTestingModule, ModalModule.forRoot()],
            schemas: [NO_ERRORS_SCHEMA]
        });

        fixture = TestBed.createComponent(SearchBarComponent);
        searchBarComponent = fixture.componentInstance;
        autoSuggestService = TestBed.inject(AutosuggestService);
        activatedRouteStub = TestBed.inject(ActivatedRoute);
    });



    it('should be created', () => {
        expect(searchBarComponent).toBeDefined();
    });

    it('should change search target', () => {
        searchBarComponent.changeTarget({value: 'name'});
        expect(searchBarComponent.selectedTarget).toBe('name');

        searchBarComponent.changeTarget({value: 'all'});
        expect(searchBarComponent.selectedTarget).toBe(null);

        searchBarComponent.changeTarget({value: 'title'});
        expect(searchBarComponent.selectedTarget).toBe('title');
    });

    it('should reset search', () => {
        searchBarComponent.searchInput.nativeElement.value = 'test';
        searchBarComponent.selectedTarget = 'test';
        expect(searchBarComponent.searchInput.nativeElement.value).toBe('test');

        // Needed for term length check
        searchBarComponent.searchService.searchTerm = 'test';

        searchBarComponent.resetSearch();
        expect(searchBarComponent.selectedTarget).toBeFalsy();
        expect(searchBarComponent.searchInput.nativeElement.value).toBeFalsy();
    });

    it('autosuggest response should be valid', fakeAsync(() => {
        spyOn(autoSuggestService, 'search').and.returnValue(of({aggregations, hits, suggest}).pipe(delay(1)));

        fixture.detectChanges();
        tick(1);

        fixture.detectChanges();
        tick(1);

        // searchBarComponent.items = new QueryList();
        // expect(searchBarComponent.items).toBe();
        searchBarComponent.queryField.setValue('');
        searchBarComponent.fireAutoSuggest();
        searchBarComponent.queryField.setValue('test');

        // Tick over the debounce time of 1000
        tick(1001);

        // Example check
        expect(searchBarComponent.autoSuggestResponse[0].hits.hits[0]._source.publicationName)
            .toBe('Eksaktit testit testissä:Fisher, Barnard ja Boschloo');

        // Check completion
    }));

});
