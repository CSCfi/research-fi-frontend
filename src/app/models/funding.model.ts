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
        public acronym: string, // ??
        public descriptionFi: string, // projectDescriptionFi
        public descriptionEn: string, // projectDescriptionEn
        public startYear: string, // fundingStartYear
        public academyConsortium: string, // fundingGroupPerson ->
        public otherConsortium: string, // fundingGroupPerson ->
        public recipient: Recipient,
        public funder: Funder,
        public funderProjectNumber: string,
        // public fieldsOfScience: FieldOfScience[],
        public fieldsOfScience: string,
        public fieldsOfResearch: string,
        public fieldsOfTheme: string,
        public projectHomePage: string,

    ) {}
}

@Injectable({
    providedIn: 'root'
})
export class FundingAdapter implements Adapter<Funding> {
    constructor(private r: RecipientAdapter, private f: FunderAdapter) {}
    adapt(item: any): Funding {
        let recipientObj = item.fundingGroupPerson.filter(x => x.consortiumProject === item.funderProjectNumber).shift();
        //Translate academy consortium role
        switch(recipientObj.roleInFundingGroup) {
            case 'leader': {
                recipientObj.roleInFundingGroup = {labelFi: 'Johtaja', labelEn: 'Leader'}
                break;
            }
            case 'partner': {
                recipientObj.roleInFundingGroup = {labelFi: 'Partneri', labelEn: 'Partner'}
                break;
            }
        }
        const otherConsortiumObj =  item.fundingGroupPerson.filter(x => x.consortiumProject !== item.funderProjectNumber); 
        const recipient = this.r.adapt(item);
        const funder = this.f.adapt(item);
        const science = item.keywords.filter(x => x.scheme === 'Tieteenala').map(x => x.keyword).join(', ');
        const research = item.keywords.filter(x => x.scheme === 'Tutkimusala').map(x => x.keyword).join(', ');
        const theme = item.keywords.filter(x => x.scheme === 'Teema-ala').map(x => x.keyword).join(', ');

        return new Funding(
            item.projectId,
            item.projectNameFi,
            item.projectNameSv,
            item.projectNameEn,
            item.acronym, // ??
            item.projectDescriptionFi,
            item.projectDescriptionEn,
            item.fundingStartYear,
            recipientObj.roleInFundingGroup,
            otherConsortiumObj,
            recipient,
            funder,
            item.funderProjectNumber,
            science,
            research,
            theme,
            item.projetHomaPage
        );
    }
}
