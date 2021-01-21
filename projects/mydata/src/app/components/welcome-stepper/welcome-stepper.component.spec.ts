import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WelcomeStepperComponent } from './welcome-stepper.component';

describe('WelcomeStepperComponent', () => {
  let component: WelcomeStepperComponent;
  let fixture: ComponentFixture<WelcomeStepperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WelcomeStepperComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomeStepperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
