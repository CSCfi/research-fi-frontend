//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltersComponent } from './filters.component';
import { Router, ActivatedRoute } from '@angular/router';
import { WINDOW_PROVIDERS } from 'src/app/services/window.service';
import { ModalModule } from 'ngx-bootstrap';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import AggResponse from '../../../../testdata/aggregationresponse.json';
import AggPublicationResponse from '../../../../testdata/aggpublicationresponse.json';
import { of } from 'rxjs/internal/observable/of';
import { PublicationFilterService } from 'src/app/services/filters/publication-filter.service';

describe('FiltersComponent', () => {
  let component: FiltersComponent;
  let fixture: ComponentFixture<FiltersComponent>;

  const routerSpy = {
    navigate: jasmine.createSpy('navigate')
  };

  const mockActivatedRoute = {
    queryParams: of({ param: 'testParam' }),
    params: of({ input: 'test input' }),
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        FiltersComponent,
      ],
      providers: [
        {provide: Router, useValue: routerSpy},
        {provide: ActivatedRoute, useValue: mockActivatedRoute},
        WINDOW_PROVIDERS,
        PublicationFilterService
      ],
      imports: [
        ModalModule.forRoot(),
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiltersComponent);
    component = fixture.componentInstance;
    component.responseData = AggResponse;
    component.activeFilters = {};
    component.width = 1000;
    component.mobile = false;
    component.showButton = false;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add parameters to preselected filter category', () => {
    component.activeFilters = Object.assign({}, {year: ['2020', '2019']});

    component.selectionChange('year', '2021');

    expect (routerSpy.navigate).toHaveBeenCalledWith([], {
      queryParams: {
        year: [ '2020', '2019', '2021' ],
        sort: undefined,
        page: 1 },
        queryParamsHandling: 'merge'
      }
    );
  });

  it('should change year range accordingly', () => {
    // Set from year to 2020 and expect query parameters to be in asceding order from chosen value to latest
    const res = Object.assign({}, {value: 2020});

    component.range(res, 'from');

    expect (routerSpy.navigate).toHaveBeenCalledWith([], {
      queryParams: {
        year: [ '2021', '2020' ],
        sort: undefined,
        page: 1 },
        queryParamsHandling: 'merge'
      }
    );
  });

  it('should select all from parent', () => {
    component.responseData.aggregations.year.subData = AggResponse.aggregations.year.buckets;
    const subFilter = component.responseData.aggregations.year;

    component.selectAll('year', subFilter);

    // Note: Year params are not in order because of preselection test
    expect (routerSpy.navigate).toHaveBeenCalledWith([], {
      queryParams: {
        year: [ '2020', '2019', '2021' ],
        sort: undefined,
        page: 1 },
        queryParamsHandling: 'merge'
      }
    );
  });

  it('should filter with term', () => {
    const event = Object.assign({}, {target: {value: 'test'}});
    // Buckets need to be moved up one level until shapeData method is called
    component.responseData.aggregations.testField.buckets = AggResponse.aggregations.testField.testFields.buckets;
    component.filterInput(event, 'testField');

    expect (component.showMoreCount.testField).toBeDefined();
  });

  it('should render corresponding filter header', () => {
    component.responseData = AggPublicationResponse;
    component.currentFilter = [{field: 'testField', label: 'Test header'}];
    component.ngOnChanges();

    fixture.detectChanges();

    const span = fixture.nativeElement.querySelector('span');
    expect(span.textContent).toBe('Test header');
  });
});
