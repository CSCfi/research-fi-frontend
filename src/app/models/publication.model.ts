// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT
import { FieldOfScience, FieldOfScienceAdapter } from './field-of-science.model';
import { Injectable } from '@angular/core';
import { Adapter } from './adapter.model';

export class Publication {
    fieldsParsed: string;

    constructor(
        public id: string, // publicationId
        public title: string, // publicationName
        public publicationYear: number,
        public publicationTypeCode: string,
        public authors: string, // authorsText
        public organizationId: number, // publicationOrgId
        public journalName: string,
        public conferenceName: string,
        public issn: string,
        public issn2: string,
        public volume: string,
        public issueNumber: string,
        public pageNumbers: string, // pageNumberText
        public articleNumber: string, // articleNumberText
        public parentPublicationTitle: string, // parentPublicationName
        public parentPublicationPublisher: string,
        public isbn: string,
        public isbn2: string,
        public publisher: string, // publisherName
        public publisherLocation: string,
        public jufoCode: string,
        public jufoClassCode: string,
        public doi: string,
        public doiHandle: string,
        public selfArchivedAddress: string,
        public keywords: any,
        public openAccess: boolean, // openAccessCode + selfArchivedCode
        public openAccessText: string,
        public internationalPublication: boolean,
        public countryCode: string,
        public languageCode: string,
        public internationalCollaboration: boolean | string,
        public businessCollaboration: boolean | string,
        public languages: any[],
        public countries: any[],
        public fieldsOfScience: FieldOfScience[],
        public author: any[],
        public selfArchivedData: any[],
        public completions: string[]
    ) {}
}

@Injectable({
    providedIn: 'root'
})
export class PublicationAdapter implements Adapter<Publication> {
    constructor(private fs: FieldOfScienceAdapter) {}
    adapt(item: any): Publication {
        let fieldsOfScience: FieldOfScience[] = [];
        // All items don't have field_of_science field
        item.fields_of_science ? item.fields_of_science.forEach(field => fieldsOfScience.push(this.fs.adapt(field))) : fieldsOfScience = [];

        const openAccess: boolean = (item.openAccessCode === 1 || item.openAccessCode === 2 || item.selfArchivedCode === 1);
        let openAccessText = '';
        // Open Access can be added from multiple fields
        if ((item.openAccessCode === 1 || item.openAccessCode === 2) || item.selfArchivedCode === 1) {
            openAccessText = 'Kyllä';
        } else if (item.openAccessCode === 0  && item.selfArchivedCode === 0) {
            openAccessText = 'Ei';
        } else {
            openAccessText = 'Ei tietoa';
        }

        item.selfArchivedAddress = item.selfArchivedData[0].selfArchived[0].selfArchivedAddress;

        return new Publication(
            item.publicationId,
            item.publicationName,
            item.publicationYear,
            item.publicationTypeCode,
            item.authorsText,
            +item.publicationOrgId,
            item.journalName,
            item.conferenceName,
            item.issn,
            item.issn2,
            item.volume,
            item.issueNumber,
            item.pageNumberText,
            item.articleNumberText,
            item.parentPublicationName,
            item.parentPublicationPublisher,
            item.isbn,
            item.isbn2,
            item.publisherName,
            item.publisherLocation,
            item.jufoCode,
            item.jufoClassCode,
            item.doi,
            item.doiHandle,
            item.selfArchivedAddress,
            item.keywords,
            openAccess, // defined above
            openAccessText,
            item.internationalCollaboration,
            item.publicationCountryCode,
            item.publicationLanguageCode,
            item.internationalCollaboration,
            item.businessCollaboration,
            item.languages,
            item.countries,
            fieldsOfScience, // defined above
            item.author,
            item.selfArchivedData,
            item.completions
        );
    }
}
