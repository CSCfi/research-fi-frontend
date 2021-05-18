//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileDataHandlerComponent } from './profile-data-handler.component';

describe('ProfileDataHandlerComponent', () => {
  let component: ProfileDataHandlerComponent;
  let fixture: ComponentFixture<ProfileDataHandlerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProfileDataHandlerComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileDataHandlerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
