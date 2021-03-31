//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrcidDataHandlerComponent } from './orcid-data-handler.component';

describe('OrcidDataHandlerComponent', () => {
  let component: OrcidDataHandlerComponent;
  let fixture: ComponentFixture<OrcidDataHandlerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OrcidDataHandlerComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrcidDataHandlerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
