// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from '../adapter.model';

export class ServicePoint {

    constructor(
        public name: string,
        public description: string,
        public visitingAddress: string,
        public phoneNumber: string,
        public emailAddress: string,
        public infoUrl: ServicePoint[],
        public accessPolicyUrl: string,
        public internationalInfraUrl: string,
    ) {}
}

@Injectable({
    providedIn: 'root'
})

export class ServicePointAdapter implements Adapter<ServicePoint> {
    constructor() {}
    adapt(item: any): ServicePoint {

        return new ServicePoint(
            item.servicePointName,
            item.servicePointDescription,
            item.servicePointVisitingAddress,
            item.servicePointPhoneNumber,
            item.servicePointEmailAddress,
            item.servicePointInfoUrl,
            item.servicePointAccessPolicyUrl,
            item.servicePointInternationalInfraUrl,
        );
    }
}
