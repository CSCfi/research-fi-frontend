import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { SearchService } from '@portal.services/search.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { WINDOW_PROVIDERS } from '@portal.services/window.service';
import { ActivatedRouteStub } from '@portal.testing/activated-route-stub';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppConfigService } from '@portal.services/app-config-service.service';
import { AppConfigServiceMock } from '@portal.services/search.service.spec';
import { ModalModule } from 'ngx-bootstrap';
import { NO_ERRORS_SCHEMA, QueryList } from '@angular/core';
import { SearchBarComponent } from './search-bar.component';
import { AutosuggestService } from '@portal.services/autosuggest.service';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { aggregations, hits, suggest } from '@portal.testdata/autosuggest-response.json';

describe('SearchBarComponent', () => {
    let searchBarComponent: SearchBarComponent;
    let fixture: ComponentFixture<SearchBarComponent>;
    let autoSuggestService: AutosuggestService;
    let searchService: SearchService;
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
        searchService = TestBed.inject(SearchService);
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
        // Spy for autosuggest service search to return mock response
        spyOn(autoSuggestService, 'search').and.returnValue(of({aggregations, hits, suggest}).pipe(delay(1)));

        // ngOnInit
        fixture.detectChanges();
        tick(1);

        // subscription
        fixture.detectChanges();
        tick(1);

        // Init values
        searchBarComponent.queryField.setValue('');
        searchBarComponent.fireAutoSuggest();
        searchBarComponent.queryField.setValue('tes');

        // Tick over the debounce time of 1000
        tick(1001);

        // Example check
        expect(searchBarComponent.autoSuggestResponse[0].hits.hits[0]._source.publicationName)
            .toBe('Eksaktit testit testissä:Fisher, Barnard ja Boschloo');

        // Check completion
        expect(searchBarComponent.completion).toBe('tesla');
    }));

    // Check completion
    it('should return correct completion', () => {
        // Test case
        searchBarComponent.autoSuggestResponse = [
            {suggest: {mySuggestions: [{options: [{text: '3-legged-person'}]}]
        }}];

        searchBarComponent.searchInput.nativeElement.value = 'legge';
        searchBarComponent.getCompletion();

        expect(searchBarComponent.completion).toBe('d-person');
    });

    // Check keydown after completion
    it('should empty completion and add it to searchInput', () => {

        searchBarComponent.completion = 'test-case';
        searchBarComponent.searchInput.nativeElement.value = 'complete ';

        // Init keyManager required for onKeydown
        searchBarComponent.items = new QueryList<any>();
        searchBarComponent.ngAfterViewInit();

        searchBarComponent.onKeydown({keyCode: 39});

        // Expect completion to be moved to search input
        expect(searchBarComponent.searchInput.nativeElement.value).toBe('complete test-case');
        expect(searchBarComponent.completion).toBe('');
    });

    // Check new input
    it('newInput should update search service input', () => {
        // Init values
        let term;
        const newTerm = 'test-term';
        searchBarComponent.searchInput.nativeElement.value = newTerm;

        // Check that term is initially empty
        searchService.currentInput.subscribe(val => term = val);
        expect(term).toBeFalsy();

        // Call new input
        searchBarComponent.newInput(undefined, undefined);
        // Get search service input
        searchService.currentInput.subscribe(val => term = val);

        // Check that input matches
        expect(term).toBe(newTerm);
    });

});
