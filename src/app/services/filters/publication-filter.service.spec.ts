//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { TestBed } from '@angular/core/testing';

import { PublicationFilterService } from './publication-filter.service';

import AggResponse from '../../../testdata/aggpublicationresponse.json';

describe('PublicationFilterService', () => {
  let service: PublicationFilterService;
  const data = AggResponse.aggregations;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PublicationFilterService);
  });

  function checkMapping(res, arr) {
    expect(
      JSON.stringify(Object.keys(res)) === JSON.stringify(arr)
    ).toBeTruthy();
  }

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should map organizations', () => {
    const res = service.organization(data.organization);
    const subData = 'subData';
    expect(res.buckets[0][subData]).toBeDefined();
  });

  it('should map fields of science to major fields', () => {
    const res = service.minorField(data.field.fields.buckets);

    res.forEach((item) => {
      expect(item.subData).toBeDefined();
    });
  });

  it('should map publication classes to parents', () => {
    const res = service.separatePublicationClass(
      data.publicationType.publicationTypes.buckets
    );

    checkMapping(res[0].subData[0], ['type', 'label', 'key', 'doc_count']);
  });

  it('should add localized country name', () => {
    const res = service.publicationCountry(
      data.countryCode.countryCodes.buckets
    );

    expect(
      res.find((item) => item.key === 'c0').label === 'Suomi'
    ).toBeTruthy();
  });

  it('should should map juFo code', () => {
    const res = service.juFoCode(data.juFo.juFoCodes.buckets);

    checkMapping(res[0], ['label', 'key', 'doc_count', 'value']);
  });

  it('should map languange', () => {
    const res = service.lang(data.lang.langs.buckets);

    checkMapping(res[0], ['label', 'key', 'doc_count']);
  });

  it('should map open access status', () => {
    const res = service.openAccess(
      data.openAccess.openAccessCodes.buckets,
      data.selfArchived.selfArchivedCodes.buckets,
      data.oaComposite
    );

    expect(
      JSON.stringify(res.map((item) => item.key)) ===
        JSON.stringify([
          'openAccess',
          'selfArchived',
          'otherOpen',
          'nonOpen',
          'noOpenAccessData',
        ])
    ).toBeTruthy();
  });

  it('should filter item with true key value', () => {
    const res = service.getSingleAmount(
      data.internationalCollaboration.internationalCollaborationCodes.buckets
    );

    expect(res.length).toBe(1);
  });
});
