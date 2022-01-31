import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TkiReportsComponent } from './tki-reports.component';

describe('TkiReportsComponent', () => {
  let component: TkiReportsComponent;
  let fixture: ComponentFixture<TkiReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TkiReportsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TkiReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
