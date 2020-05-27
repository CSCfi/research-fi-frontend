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
        public ESFRICode: string,
        public merilCode: string,
        public urn: string,
        public responsibleOrganization: string,
        public statCenterId: string,
        public replacingInfraStructure: string,
        public keywords: string[],
        public fieldsOfScience: object[],
        public services: InfraService[],
        public keywordsString: string,
        public fieldsOfScienceString: string,
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
        const fieldsOfScience: string[] = [];

        // Init and assign if available
        let responsibleOrganization = '';
        if (item.responsibleOrganization) {
            responsibleOrganization = this.lang.testLang('responsibleOrganizationName', item.responsibleOrganization[0]);
        }

        // Assign if available
        const esfriCode = item.ESFRICodes?.length > 0 ? item.ESFRICodes.map(x => x.ESFRICode)[0] : '';

        item.services?.forEach(service => services.push(this.isa.adapt(service)));
        item.keywords?.forEach(obj => keywords.push(obj.keyword));
        item.fieldsOfScience?.forEach(obj => fieldsOfScience.push(obj.name_fi));

        const keywordsString = keywords?.join(', ');

        const fieldsOfScienceString = fieldsOfScience?.join(', ');

        return new Infrastructure(
            this.lang.testLang('name', item),
            this.lang.testLang('name', item),
            this.lang.testLang('description', item),
            item.scientificDescription,
            item.startYear,
            item.endYear,
            item.acronym,
            item.finlandRoadmap,
            esfriCode,
            item.merilCode,
            item.urn,
            responsibleOrganization,
            item.TKOppilaitosTunnus,
            item.replacingInfraStructure,
            keywords,
            item.fieldsOfScience,
            services,
            keywordsString,
            fieldsOfScienceString
        );
    }
}
