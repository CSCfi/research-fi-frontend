import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DraftSummaryComponent } from './draft-summary.component';

describe('DraftSummaryComponent', () => {
  let component: DraftSummaryComponent;
  let fixture: ComponentFixture<DraftSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DraftSummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DraftSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
