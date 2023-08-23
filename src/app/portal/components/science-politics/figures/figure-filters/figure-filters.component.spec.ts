import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';
import { FigureFiltersComponent } from './figure-filters.component';

describe('FigureFiltersComponent', () => {
  let component: FigureFiltersComponent;
  let fixture: ComponentFixture<FigureFiltersComponent>;
  const routerSpy = { navigate: jasmine.createSpy('navigate') };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FigureFiltersComponent],
      providers: [{ provide: Router, useValue: routerSpy }],
      imports: [MatChipsModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FigureFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate with params', () => {
    component.navigate('test');
    expect(routerSpy.navigate).toHaveBeenCalledWith([], {
      queryParams: {
        filter: 'test',
      },
    });
  });
});
