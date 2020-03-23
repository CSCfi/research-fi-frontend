// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from './adapter.model';

export class Infrastructure {

    constructor(
        public infraId: string,
        public name: string,
        public acronym: string,
        public responsibleOrganizationNameFi: string,
        public responsibleOrganizationNameSv: string,
        public responsibleOrganizationNameEn: string,
        public serviceName: string,
    ) {}
}

@Injectable({
    providedIn: 'root'
})

export class InfrastructureAdapter implements Adapter<Infrastructure> {
    constructor() {}
    adapt(item: any): Infrastructure {

        return new Infrastructure(
            item.urn,
            item.name,
            item.acronym,
            item.responsibleOrganizationNameFi,
            item.responsibleOrganizationNameSv,
            item.responsibleOrganizationNameEn,
            item.serviceName,
        )
    }
}