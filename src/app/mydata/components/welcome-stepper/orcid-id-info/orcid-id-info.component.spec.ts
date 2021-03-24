//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrcidIdInfoComponent } from './orcid-id-info.component';

describe('OrcidIdInfoComponent', () => {
  let component: OrcidIdInfoComponent;
  let fixture: ComponentFixture<OrcidIdInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrcidIdInfoComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrcidIdInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
