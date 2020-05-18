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
        item.callProgrammeNameFi = this.lang.checkContent(
            item.callProgrammeNameFi, item.callProgrammeNameEn, item.callProgrammeNameSv);
        return new Funder(
            item.funderNameFi,
            item.funderNameSv,
            item.funderNameEn,
            item.funderNameUnd,
            item.typeOfFundingId,
            item.typeOfFundingNameFi,
            item.typeOfFundingNameSv,
            item.typeOfFundingNameEn,
            item.callProgrammeNameFi,
            item.callProgrammeNameSv,
            item.callProgrammeNameEn,
            item.callProgrammeNameUnd,
            item.callProgrammeHomePage
        );
    }
}
