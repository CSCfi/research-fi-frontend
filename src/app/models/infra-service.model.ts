// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from './adapter.model';
import { ServicePoint, ServicePointAdapter } from './service-point.model';

export class InfraService {

    constructor(
        public name: string,
        public description: string,
        public scientificDescription: string,
        public acronym: string,
        public type: string,
        public servicePoints: ServicePoint[],
    ) {}
}

@Injectable({
    providedIn: 'root'
})

export class InfraServiceAdapter implements Adapter<InfraService> {
    constructor(private spa: ServicePointAdapter) {}
    adapt(item: any): InfraService {

        const servicePoints: ServicePoint[] = [];

        servicePoints.push(this.spa.adapt(item));

        return new InfraService(
            item.serviceName,
            item.serviceDescription,
            item.serviceScientificDescription,
            item.acronym,
            item.serviceType,
            servicePoints,
        );
    }
}
