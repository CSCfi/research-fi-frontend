//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { OrganizationFilters } from './organizations';
import AggResponse from '../../../../testdata/aggregationresponse.json';

describe('OrganizationFilters', () => {
    let filter: OrganizationFilters;

    beforeEach(() => {
        filter = new OrganizationFilters();
    });

    it('should map data', () => {
        const data = AggResponse.aggregations.testField;
        // We need to mock correct fieldName and id that would occur in real data
        const sectorName = 'sectorName';
        data.testFields.buckets.map(item => {item[sectorName] = item.testFieldId, item.key = '1'; });

        const res = filter.sector(AggResponse.aggregations.testField.testFields.buckets);
        expect(res[0].label).toBeDefined();
    });

  });