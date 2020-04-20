// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT
import { Injectable } from '@angular/core';
import { Adapter } from './adapter.model';
import { Recipient, RecipientAdapter } from './recipient.model';
import { Funder, FunderAdapter } from './funder.model';

export class Funding {

    constructor(
        public id: number,
        public nameFi: string, // projectNameFi
        public nameSv: string, // projectNameSv
        public nameEn: string, // projectNameEn
        public acronym: string,
        public descriptionFi: string, // projectDescriptionFi
        public descriptionEn: string, // projectDescriptionEn
        public startYear: string, // fundingStartYear
        public academyConsortium: string, // fundingGroupPerson ->
        public otherConsortium: any[], // fundingGroupPerson ->
        public recipient: Recipient,
        public funder: Funder,
        public funderProjectNumber: string,
        // public fieldsOfScience: FieldOfScience[],
        public fieldsOfScience: string,
        public fieldsOfResearch: string,
        public fieldsOfTheme: string,
        public projectHomePage: string,
        public recipientType: string

    ) {}
}

@Injectable({
    providedIn: 'root'
})
export class FundingAdapter implements Adapter<Funding> {
    constructor(private r: RecipientAdapter, private f: FunderAdapter) {}
    adapt(item: any): Funding {
        const recipientObj = item.fundingGroupPerson ?
                             item.fundingGroupPerson.filter(x => x.consortiumProject === item.funderProjectNumber).shift() : {};
        // Determine recipient type based on existence and contents of fundingGroupPerson
        switch (item.fundingGroupPerson?.length) {
            // No person -> organization
            case undefined: {
                item.recipientType = 'organization';
                break;
            }
            // One person -> person, don't show consortium
            case 1: {
                item.recipientType = 'person';
                break;
            }
            // More than one -> consortium
            default: {
                item.recipientType = 'consortium';
                break;
            }
        }
        // Translate academy consortium role
        switch (recipientObj?.roleInFundingGroup) {
            case 'leader': {
                recipientObj.roleInFundingGroup = {labelFi: 'Johtaja', labelEn: 'Leader'};
                break;
            }
            case 'partner': {
                recipientObj.roleInFundingGroup = {labelFi: 'Partneri', labelEn: 'Partner'};
                break;
            }
        }
        // Trim all string elements
        item.fundingGroupPerson?.forEach(element => {
            Object.keys(element).map(k => element[k] = typeof element[k] === 'string' ? element[k].trim() : element[k]);
        });
        const otherConsortiumObjs = item.fundingGroupPerson ?
                                    item.fundingGroupPerson.filter(x => x.consortiumProject !== item.funderProjectNumber) : [];
        const recipient = this.r.adapt(item);
        const funder = this.f.adapt(item);
        const science = item.keywords?.filter(x => x.scheme === 'Tieteenala').map(x => x.keyword).join(', ');
        const research = item.keywords?.filter(x => x.scheme === 'Tutkimusala').map(x => x.keyword).join(', ');
        const theme = item.keywords?.filter(x => x.scheme === 'Teema-ala').map(x => x.keyword).join(', ');
        return new Funding(
            item.projectId,
            item.projectNameFi,
            item.projectNameSv,
            item.projectNameEn,
            item.projectAcronym,
            item.projectDescriptionFi,
            item.projectDescriptionEn,
            item.fundingStartYear,
            recipientObj?.roleInFundingGroup,
            otherConsortiumObjs,
            recipient,
            funder,
            item.funderProjectNumber,
            science,
            research,
            theme,
            item.projetHomePage,
            item.recipientType
        );
    }
}
