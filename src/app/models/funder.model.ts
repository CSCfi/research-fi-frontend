// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Adapter } from './adapter.model';
import { Injectable } from '@angular/core';
import { LanguageCheck } from './utils';

export class Funder {
    constructor(
        public nameFi: string,
        public nameSv: string,
        public nameEn: string,
        public nameUnd: string,
        public typeOfFundingId: string,
        public typeOfFundingNameFi: string,
        public typeOfFundingNameSv: string,
        public typeOfFundingNameEn: string,
        public callProgrammeNameFi: string,
        public callProgrammeNameSv: string,
        public callProgrammeNameEn: string,
        public callProgrammeNameUnd: string,
        public callProgrammeHomePage: string,
    ) {}
}

@Injectable({
    providedIn: 'root'
})
export class FunderAdapter implements Adapter<Funder> {
    constructor(private lang: LanguageCheck) {}
    adapt(item: any): Funder {
        return new Funder(
            this.lang.testLang('funderNameFi', item),
            this.lang.testLang('funderNameSv', item),
            this.lang.testLang('funderNameEn', item),
            item.funderNameUnd,
            item.typeOfFundingId,
            this.lang.testLang('typeOfFundingNameFi', item),
            this.lang.testLang('typeOfFundingNameSv', item),
            this.lang.testLang('typeOfFundingNameEn', item),
            this.lang.testLang('callProgrammeNameFi', item),
            this.lang.testLang('callProgrammeNameSv', item),
            this.lang.testLang('callProgrammeNameEn', item),
            item.callProgrammeNameUnd,
            item.callProgrammeHomePage
        );
    }
}
