//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { TestBed } from '@angular/core/testing';

import { NewsFilterService } from './news-filter.service';
import AggResponse from '../../../../testdata/aggnewsresponse.json';

describe('NewsFilterService', () => {
  let service: NewsFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewsFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should map organizations', () => {
    const res = service.organization(
      AggResponse.aggregations.organization.buckets
    );
    res.forEach((item) => {
      expect(item.subData).toBeDefined();
    });
  });
});
