import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryAffiliationComponent } from './summary-affiliation.component';

describe('SummaryAffiliationComponent', () => {
  let component: SummaryAffiliationComponent;
  let fixture: ComponentFixture<SummaryAffiliationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SummaryAffiliationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryAffiliationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
