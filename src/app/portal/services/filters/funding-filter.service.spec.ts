//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { TestBed } from '@angular/core/testing';

import { FundingFilterService } from './funding-filter.service';
import AggResponse from '../../../../testdata/aggfundingresponse.json';

describe('FundingFilterService', () => {
  let service: FundingFilterService;
  const data = AggResponse.aggregations;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FundingFilterService);
    service.currentLocale = 'Fi';
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should map organizations', () => {
    const res = service.organization(
      data.organization,
      data.organizationConsortium
    );
    expect(res[0].subData).toBeDefined();
  });

  it('should set funder label', () => {
    const res = service.funder(data.funder.funders.buckets);
    expect(res[0].label !== res[0].key).toBeTruthy();
  });

  it('should map type of funding', () => {
    const res = service.typeOfFunding(data.typeOfFunding.types.buckets);
    res.forEach((item) => {
      expect(item.subData).toBeDefined();
      expect(item.headerFi).toBeDefined();
      expect(item.headerEn).toBeDefined();
      expect(item.headerSv).toBeDefined();
    });
  });

  it('should map field of science', () => {
    const res = service.minorField(data.field.fields.buckets);

    res.forEach((item) => {
      expect(item.subData).toBeDefined();
    });
  });
});
