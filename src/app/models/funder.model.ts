// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Adapter } from './adapter.model';
import { Injectable } from '@angular/core';

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
    constructor() {}

    adapt(item: any): Funder {
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
