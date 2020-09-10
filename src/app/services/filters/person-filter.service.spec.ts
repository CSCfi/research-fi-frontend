//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { TestBed } from '@angular/core/testing';

import { PersonFilterService } from './person-filter.service';

describe('PersonFilterService', () => {
  let service: PersonFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersonFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
