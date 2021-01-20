// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from '../adapter.model';
import { LanguageCheck } from '../utils';

export class Dataset {

    constructor(
        public id: string,
        public name: string,
        public description: string,
        public year: string,
        public type: string,
        public authors: string,
        public project: string,
        public fieldsOfScience: string,
        public lang: string,
        public availability: string,
        public license: string,
        public keywords: string,
        public coverage: string,
        public dataCatalog: string,
        public openAccess: boolean,
        public doi: string,
    ) {}
}

@Injectable({
    providedIn: 'root'
})

export class DatasetAdapter implements Adapter<Dataset> {
    constructor(private lang: LanguageCheck) {}
    adapt(item: any): Dataset {

        const keywords = item.keywords ? item.keywords.map(x => x.keyword) : [];

        return new Dataset(
            item.identifier,
            this.lang.testLang('name', item),
            this.lang.testLang('description', item),
            item.datasetCreated,
            'tyyppi - test',
            'tekijät - test',
            'projekti - test',
            'tieteenalat - test',
            'kieli - test',
            this.lang.translateAccessType(item.accessType),
            this.lang.testLang('licenseName', item),
            keywords.join(', '),
            'kattavuus - test',
            this.lang.testLang('name', item?.dataCatalog[0]),
            item.accessType === 'open',
            Math.random() > 0.5 ? 'test' : undefined // DOI test
        );
    }
}
