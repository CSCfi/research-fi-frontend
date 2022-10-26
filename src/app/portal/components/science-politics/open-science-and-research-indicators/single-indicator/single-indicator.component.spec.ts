import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleIndicatorComponent } from './single-indicator.component';

describe('SingleIndicatorComponent', () => {
  let component: SingleIndicatorComponent;
  let fixture: ComponentFixture<SingleIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SingleIndicatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
