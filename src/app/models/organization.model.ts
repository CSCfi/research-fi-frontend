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
        public name: string,
        public variantNames: string,
        public organizationType: string,
        public sectorName: string,
        public address: string,
        public postAddress: string,
        public businessId: string,
        public staffCount: number,
        public thesisCountBsc: string,
        public thesisCountMsc: string,
        public thesisCountLic: string,
        public thesisCountPhd: string,
        public thesisCountBscPercentage: number,
        public thesisCountMscPercentage: number,
        public thesisCountLicPercentage: number,
        public thesisCountPhdPercentage: number,
        public subUnits: any[]
    ) {}
}

@Injectable({
    providedIn: 'root'
})

export class OrganizationAdapter implements Adapter<Organization> {
    constructor() {}
    adapt(item: any): Organization {
        return new Organization(
            item.id,
            item.name,
            item.variantNames,
            item.organizationType,
            item.sectorName,
            item.address,
            item.postAddress,
            item.businessId,
            item.staffCount,
            item.thesisCountBsc,
            item.thesisCountMsc,
            item.thesisCountLic,
            item.thesisCountPhd,
            item.thesisCountBscPercentage,
            item.thesisCountMscPercentage,
            item.thesisCountLicPercentage,
            item.thesisCountPhdPercentage,
            item.subUnits
        )
    }
}