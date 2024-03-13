import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterLimitButtonComponent } from './filter-limit-button.component';

describe('FilterLimitButtonComponent', () => {
  let component: FilterLimitButtonComponent;
  let fixture: ComponentFixture<FilterLimitButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ FilterLimitButtonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterLimitButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
