// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Adapter } from './adapter.model';
import { Injectable } from '@angular/core';

export class RecipientOrganization {
    constructor(
        public id: string,
        public businessId: string,
        public nameFi: string,
        public nameSv: string,
        public nameEn: string,
        public role: string,
        public shareOfFundingEur: number,
        public pic: string,
    ) {}
}

@Injectable({
    providedIn: 'root'
})
export class RecipientOrganizationAdapter implements Adapter<RecipientOrganization> {
    constructor() {}
    adapt(item: any): RecipientOrganization {
        // Trim all string elements
        if (item) {
            Object.keys(item).map(k => item[k] = typeof item[k] === 'string' ? item[k].trim() : item[k]);
        }
        console.log(item)
        return new RecipientOrganization(
            item.consortiumOrganizationId,
            item.consortiumOrganizationBusinessId,
            item.consortiumOrganizationNameFi,
            item.consortiumOrganizationNameSv,
            item.consortiumOrganizationNameEn,
            item.roleInConsortium,
            item.shareOfFundingInEur,
            item.consortiumOrganizationPic
        );
    }
}
