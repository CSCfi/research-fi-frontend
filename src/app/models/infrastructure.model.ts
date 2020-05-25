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
        public urn: string,
        public responsibleOrganization: Object,
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

        const services: InfraService[] = [];
        const keywords: string[] = [];

        if (item.responsibleOrganization) {
            item.responsibleOrganization[0].responsibleOrganizationNameFi =
                this.lang.testLang('responsibleOrganizationNameFi', item.responsibleOrganization[0]);
            item.responsibleOrganization[0].responsibleOrganizationNameSv =
                this.lang.testLang('responsibleOrganizationNameSv', item.responsibleOrganization[0]);
            item.responsibleOrganization[0].responsibleOrganizationNameEn =
                this.lang.testLang('responsibleOrganizationNameEn', item.responsibleOrganization[0]);
        }

        item.services?.forEach(service => services.push(this.isa.adapt(service)));
        item.keywords?.forEach(obj => keywords.push(obj.keyword));

        const keywordsString = keywords?.join(', ');

        return new Infrastructure(
            item.name,
            item.name,
            item.description,
            item.scientificDescription,
            item.startYear,
            item.endYear,
            item.acronym,
            item.finlandRoadmap,
            item.urn,
            item.responsibleOrganization[0],
            item.TKOppilaitosTunnus,
            keywords,
            services,
            keywordsString,
        );
    }
}
