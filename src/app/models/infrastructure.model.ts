// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from './adapter.model';
import { InfraService, InfraServiceAdapter } from './infra-service.model';
import { LanguageCheck } from './utils';

export class Infrastructure {

    constructor(
        public id: string,
        public name: string,
        public description: string,
        public scientificDescription: string,
        public startYear: string,
        public endYear: string,
        public acronym: string,
        public finlandRoadmap: string,
        public ESFRICodes: string,
        public urn: string,
        public responsibleOrganization: string,
        public statCenterId: string,
        public keywords: string[],
        public services: InfraService[],
        public keywordsString: string,
    ) {}
}

@Injectable({
    providedIn: 'root'
})

export class InfrastructureAdapter implements Adapter<Infrastructure> {
    constructor(private isa: InfraServiceAdapter, private lang: LanguageCheck) {}
    adapt(item: any): Infrastructure {
        console.log(item)

        const services: InfraService[] = [];
        const keywords: string[] = [];

        // Init and assign if available
        let responsibleOrganization = '';
        if (item.responsibleOrganization) {
            responsibleOrganization = this.lang.testLang('responsibleOrganizationName', item.responsibleOrganization[0]);
        }

        item.services?.forEach(service => services.push(this.isa.adapt(service)));
        item.keywords?.forEach(obj => keywords.push(obj.keyword));

        const keywordsString = keywords?.join(', ');

        return new Infrastructure(
            this.lang.testLang('name', item),
            this.lang.testLang('name', item),
            this.lang.testLang('description', item),
            item.scientificDescription,
            item.startYear,
            item.endYear,
            item.acronym,
            item.finlandRoadmap,
            item.ESFRICodes,
            item.urn,
            responsibleOrganization,
            item.TKOppilaitosTunnus,
            keywords,
            services,
            keywordsString,
        );
    }
}
