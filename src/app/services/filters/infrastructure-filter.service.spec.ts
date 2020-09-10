//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { TestBed } from '@angular/core/testing';

import { InfrastructureFilterService } from './infrastructure-filter.service';

describe('InfrastructureFilterService', () => {
  let service: InfrastructureFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InfrastructureFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
