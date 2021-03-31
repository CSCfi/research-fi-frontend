//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

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
