// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from './adapter.model';

export class Organization {

    constructor(
        public id: string,
        public nameFi: string,
        public nameEn: string,
        public nameSv: string,
        public variantNames: string,
        public organizationType: string,
        public sectorNameFi: string,
        public sectorNameEn: string,
        public sectorNameSv: string,
        public address: string,
        public postAddress: string,
        public businessId: string,
        public staffCountAsFte: number,
        public staffCountAsPercentage: number,
        public staffYear: string,
        public thesisYear: string,
        public thesisCountBsc: string,
        public thesisCountMsc: string,
        public thesisCountLic: string,
        public thesisCountPhd: string,
        public thesisCountBscPercentage: number,
        public thesisCountMscPercentage: number,
        public thesisCountLicPercentage: number,
        public thesisCountPhdPercentage: number,
        public subUnits: any[],
        public homepage: string,
        public predecessors: string
    ) {}
}

@Injectable({
    providedIn: 'root'
})

export class OrganizationAdapter implements Adapter<Organization> {
    constructor() {}
    adapt(item: any): Organization {
        // Join predecessors with comma
        const predecessors = item.predecessors ? item.predecessors.map(x => x.nameFi.trim()).join(', ') : '';

        return new Organization(
            item.organizationId,
            item.nameFi.trim(),
            item.nameEn,
            item.nameSv,
            item.variantNames,
            item.organizationType,
            item.sectorNameFi,
            item.sectorNameEn,
            item.sectorNameSv,
            item.address,
            item.postAddress,
            item.businessId,
            item.staffCountAsFte,
            item.staffCountAsPercentage,
            item.staffYear,
            item.thesisYear,
            item.thesisCountBsc,
            item.thesisCountMsc,
            item.thesisCountLic,
            item.thesisCountPhd,
            item.thesisCountBscPercentage,
            item.thesisCountMscPercentage,
            item.thesisCountLicPercentage,
            item.thesisCountPhdPercentage,
            item.subUnits,
            item.homepage,
            predecessors
        )
    }
}