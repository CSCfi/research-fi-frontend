import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FigureFiltersComponent } from './figure-filters.component';

describe('FigureFiltersComponent', () => {
  let component: FigureFiltersComponent;
  let fixture: ComponentFixture<FigureFiltersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FigureFiltersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FigureFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
