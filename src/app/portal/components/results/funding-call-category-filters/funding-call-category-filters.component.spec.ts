import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FundingCallCategoryFiltersComponent } from './funding-call-category-filters.component';

describe('FundingCallCategoryFiltersComponent', () => {
  let component: FundingCallCategoryFiltersComponent;
  let fixture: ComponentFixture<FundingCallCategoryFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FundingCallCategoryFiltersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FundingCallCategoryFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
