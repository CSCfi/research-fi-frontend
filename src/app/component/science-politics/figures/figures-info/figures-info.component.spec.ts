import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FiguresInfoComponent } from './figures-info.component';

describe('FiguresInfoComponent', () => {
  let component: FiguresInfoComponent;
  let fixture: ComponentFixture<FiguresInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FiguresInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FiguresInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
