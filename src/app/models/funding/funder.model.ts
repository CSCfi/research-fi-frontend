// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Adapter } from '../adapter.model';
import { Injectable } from '@angular/core';
import { LanguageCheck } from '../utils';

export class Funder {
    constructor(
        public name: string,
        public nameUnd: string,
        public typeOfFundingId: string,
        public typeOfFundingName: string,
        public callProgrammeName: string,
        public callProgrammeNameUnd: string,
        public callProgrammeHomePage: string,
        public frameworkProgramme: string,
        public euCallProgrammes: {name: string, id: string}[],
        public topicName: string,
        public topicId: string,
        public euCallId: string,
        public businessId: string
    ) {}
}

@Injectable({
    providedIn: 'root'
})
export class FunderAdapter implements Adapter<Funder> {
    constructor(private lang: LanguageCheck) {}
    adapt(item: any): Funder {

        const callProgrammes: {name: string, id: string}[] = [];

        item?.callProgrammes?.forEach(p => {
            callProgrammes.push({name: this.lang.testLang('callProgrammeName', p), id: p?.callProgrammeId});
        });

        return new Funder(
            this.lang.testLang('funderName', item),
            item.funderNameUnd,
            item.typeOfFundingId,
            this.lang.testLang('typeOfFundingName', item).trim().length > 0 ? this.lang.testLang('typeOfFundingName', item) : item.typeOfFundingId,
            this.lang.testLang('callProgrammeName', item),
            item.callProgrammeNameUnd,
            item.callProgrammeHomePage,
            this.lang.testLang('frameworkProgrammeName', item?.frameworkProgramme?.slice(0).pop()),
            callProgrammes,
            this.lang.testLang('topicName', item),
            item?.topicId,
            item?.euCallId,
            item.funderBusinessId[0].pid_content
        );
    }
}
