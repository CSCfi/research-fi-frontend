//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { TestBed } from '@angular/core/testing';

import { InfrastructureFilterService } from './infrastructure-filter.service';
import AggResponse from 'src/testdata/agginfrastructureresponse.json';

describe('InfrastructureFilterService', () => {
  let service: InfrastructureFilterService;
  const data = AggResponse.aggregations;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InfrastructureFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should shape data', () => {
    const res = service.shapeData(AggResponse);
    expect(res.shaped).toBeDefined();
  });

  it('should map organizations', () => {
    const res = service.mapOrganizations(data.organization);
    expect(res.some((sector: { subData: any[]; }) => sector.subData)).toBeDefined()
  });

  it('should map types', () => {
    const res = service.typeLabel(data.type.types.buckets);

    res.forEach((element) => {
      expect(element.label).toBeDefined();
    });
  });

  it('should map field of science', () => {
    const res = service.field(data.infraField.infraFields).buckets;
    res.forEach((element) => {
      expect(element.label).toBeDefined();
    });
  });
});
