//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { TestBed } from '@angular/core/testing';

import { OrganizationFilterService } from './organization-filter.service';

import AggResponse from '../../../testdata/aggorganizationresponse.json';


describe('OrganizationFilterService', () => {
  let service: OrganizationFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrganizationFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should shape data', () => {
    const res = service.shapeData(AggResponse);

    expect(res.shaped).toBeDefined();
  });

  it('should map sector data', () => {
    const res = service.sector(AggResponse.aggregations.sector.sectorId.buckets);

    expect(Object.keys(res[0]).length).toBe(4);
  });
});
