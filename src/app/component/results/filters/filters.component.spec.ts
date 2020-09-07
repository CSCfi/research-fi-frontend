import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltersComponent } from './filters.component';
import { Router, ActivatedRoute } from '@angular/router';
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
import { WINDOW_PROVIDERS } from 'src/app/services/window.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { ModalModule } from 'ngx-bootstrap';
import { ActivatedRouteStub } from 'src/testing/activated-route-stub';

describe('FiltersComponent', () => {
  let component: FiltersComponent;
  let fixture: ComponentFixture<FiltersComponent>;

  const router = {
    navigate: jasmine.createSpy('navigate')
  };

  const queryParamMock = ['testParam'];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FiltersComponent ],
      providers: [
        {provide: Router, useValue: router},
        {provide: ActivatedRoute, useValue: new ActivatedRouteStub()},
        WINDOW_PROVIDERS,
      ],
      imports: [
        ModalModule.forRoot(),
      ]
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
