// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from '../adapter.model';
import { ServicePoint, ServicePointAdapter } from './service-point.model';
import { LanguageCheck } from '../utils';

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
    constructor(private spa: ServicePointAdapter, private langCheck: LanguageCheck) {}
    adapt(item: any): InfraService {

        const servicePoints: ServicePoint[] = [];

        item.servicePoints.forEach(sp => {
            servicePoints.push(this.spa.adapt(sp));
        });

        return new InfraService(
            this.langCheck.testLang('serviceName', item),
            this.langCheck.testLang('serviceDescription', item),
            this.langCheck.testLang('serviceScientificDescription', item),
            item.serviceAcronym,
            this.langCheck.translateInfraServiceType(item.serviceType),
            servicePoints,
        );
    }
}
