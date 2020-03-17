// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from './adapter.model';

export class Recipient {
    constructor(
        public personName: string,
        public personOrcid: string,
        public affiliation: string,
        public organizationName: string,
        public shareOfFundingEur: number,
        public amountEur: number,
        public contactPersonName: string,
    ) {}
}
@Injectable({
    providedIn: 'root'
})
export class RecipientAdapter implements Adapter<Recipient> {
    constructor() {}
    adapt(item: any): Recipient {
        const recipientObj = item.fundingGroupPerson.filter(x => x.consortiumProject === item.funderProjectNumber).shift();

        return new Recipient(
            recipientObj?.fundingGroupPersonFirstNames,
            recipientObj?.fundingGroupPersonOrcid,
            recipientObj?.consortiumOrganizationNameFi, // affiliation
            recipientObj?.consortiumOrganizationNameFi, // organizationName
            recipientObj?.shareOfFundingInEur,
            item.amount_in_EUR,
            item.fundingContactPersonLastName
        );
    }
}
