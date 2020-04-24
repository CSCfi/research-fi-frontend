// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from './adapter.model';
import { RecipientOrganization, RecipientOrganizationAdapter } from './recipient-organization.model';

export class Recipient {
    [x: string]: any;
    constructor(
        public personName: string,
        public personOrcid: string,
        public affiliation: string,
        public organizationName: string,
        public organizationId: string,
        public shareOfFundingEur: number,
        public amountEur: number,
        public contactPersonName: string,
        public contactPersonOrcid: string,
        public organizations: RecipientOrganization[],
        public combined: string
    ) {}
}
@Injectable({
    providedIn: 'root'
})
export class RecipientAdapter implements Adapter<Recipient> {
    constructor(private roa: RecipientOrganizationAdapter) {}
    adapt(item: any): Recipient {
        const recipientObj = item.fundingGroupPerson?.filter(x => x.consortiumProject === item.funderProjectNumber).shift();
        const organizations: RecipientOrganization[] = [];

        // Combine recipient names and organizations, this is used in funding results component
        let combined = '';
        if (item.recipientType === 'organization' && item.organizationConsortium) {
            item.organizationConsortium.forEach(o => organizations.push(this.roa.adapt(o)));
            // Get Finnish organizations only (based on business id)
            if (item.organizationConsortium.find(org => org.consortiumOrganizationBusinessId?.trim().slice(-2)[0] === '-')) {
                combined = item.organizationConsortium.find(org =>
                    org.consortiumOrganizationBusinessId?.trim().slice(-2)[0] === '-').consortiumOrganizationNameFi;
            } else {
                combined = item.organizationConsortium.filter(x =>
                    // Check for empty and filter out uppercase organizations. Uppercased organizations are duplicates
                    // (x.consortiumOrganizationNameFi.trim() !== '' && x.consortiumOrganizationNameFi.toUpperCase() !==
                                                                        // x.consortiumOrganizationNameFi) &&
                    (x.consortiumOrganizationNameFi.trim() !== '') &&
                    // Check for finnish business ID identifier
                    (x.consortiumOrganizationBusinessId?.trim().slice(-2)[0] === '-' ||
                    x.consortiumOrganizationBusinessId?.trim().slice(0, 2) === 'FI' ))
                    .map(x => x.consortiumOrganizationNameFi.trim()).join('; ');
            }
        // Check that a finnish organization is found
        } else if (item.fundingGroupPerson && item.fundingGroupPerson.find
                  // Check for finnish business ID identifier
                  (x => x.consortiumOrganizationBusinessId?.trim().slice(-2)[0] === '-' ||
                  x.consortiumOrganizationBusinessId?.trim().slice(0, 2) === 'FI')) {
                // Get target recipient
                const person = item.fundingGroupPerson.find(x => x.consortiumProject === item.funderProjectNumber);
                // Map recipients
                if (person) {
                    combined = person.fundingGroupPersonFirstNames + ' ' + person.fundingGroupPersonLastName + ', '
                    + person.consortiumOrganizationNameFi;
                } else {
                    // If no match with funderProjectNumber
                    combined = item.fundingGroupPerson?.map(x =>
                        x.fundingGroupPersonLastName.trim().length > 0 ? x.fundingGroupPersonFirstNames + ' ' + x.fundingGroupPersonLastName
                        + (x.consortiumOrganizationNameFi.trim().length > 0 ? ', ' + x.consortiumOrganizationNameFi.trim() : null) :
                        x.consortiumOrganizationNameFi.trim()).join('; ');
                }
        // If no match with Finnish organization
        } else if (item.recipientType === 'person' && item.fundingGroupPerson.find(x => x.fundingGroupPersonLastName.trim().length > 0)) {
            combined = item.fundingGroupPerson?.map(x => x.fundingGroupPersonLastName.trim().length > 0 ?
            x.fundingGroupPersonFirstNames + ' ' + x.fundingGroupPersonLastName : null).join('; ');
        } else {
            combined = '-';
        }

        return new Recipient(
            recipientObj ? recipientObj?.fundingGroupPersonFirstNames + ' ' + recipientObj?.fundingGroupPersonLastName : '',
            recipientObj?.fundingGroupPersonOrcid,
            recipientObj?.consortiumOrganizationNameFi, // affiliation
            recipientObj?.consortiumOrganizationNameFi, // organizationName
            recipientObj?.consortiumOrganizationId,
            recipientObj?.shareOfFundingInEur,
            item.amount_in_EUR,
            item.fundingContactPersonFirstNames + ' ' + item.fundingContactPersonLastName,
            item.fundingContactPersonOrcid,
            organizations,
            combined
        );
    }
}
