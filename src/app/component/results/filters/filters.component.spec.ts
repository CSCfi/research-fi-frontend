import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltersComponent } from './filters.component';
import { Router } from '@angular/router';
import { SortService } from '../../../services/sort.service';
import { ResizeService } from '../../../services/resize.service';
import { FilterService } from '../../../services/filter.service';
import { UtilityService } from 'src/app/services/utility.service';
import { PublicationFilters } from './publications';
import { PersonFilters } from './persons';
import { FundingFilters } from './fundings';
import { InfrastructureFilters } from './infrastructures';
import { OrganizationFilters } from './organizations';
import { NewsFilters } from './news';
import { DataService } from 'src/app/services/data.service';

describe('FiltersComponent', () => {
  let component: FiltersComponent;
  let fixture: ComponentFixture<FiltersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FiltersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
