// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from '../adapter.model';
import { LanguageCheck } from '../utils';

export class Material {

    constructor(
        public id: string,
        public name: string,
        public description: string,
        public year: number,
        public openAccess: boolean,
        public doi: string,
    ) {}
}

@Injectable({
    providedIn: 'root'
})

export class MaterialAdapter implements Adapter<Material> {
    constructor(private lang: LanguageCheck) {}
    adapt(item: any): Material {

        return new Material(
            item.identifier,
            this.lang.testLang('name', item),
            this.lang.testLang('description', item),
            item.datasetCreated.slice(0, 4),
            Math.random() > 0.5, // Open access test
            Math.random() > 0.5 ? 'test' : undefined // DOI test
        );
    }
}
