// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT
import { FieldOfScience, FieldOfScienceAdapter } from './field-of-science.model';
import { Injectable } from '@angular/core';
import { Adapter } from './adapter';
import { LinksPipe } from '../pipes/links.pipe';

export class Publication {

    constructor(
        public id: number, // publicationId
        public title: string, // publicationName
        public publicationYear: number,
        public authors: string, // authorsText
        public author: object,
        public organizationId: number, // publicationOrgId
        public journalName: string,
        public conferenceName: string,
        public issn: string,
        public issn2: string,
        public volume: string,
        public issueNumber: string,
        public pageNumbers: string, // pageNumbersText
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
        public fieldsOfScience: FieldOfScience[],
        public keywords: string,
        public openAccess: boolean, // openAccessCode + selfArchivedCode
        public internationalPublication: boolean,
        public countryCode: string,
        public languageCode: string,
        public internationalCollaboration: boolean,
        public businessCollaboration: boolean,
    ) {}
}

@Injectable({
    providedIn: 'root'
})
export class PublicationAdapter implements Adapter<Publication> {
    constructor(private fs: FieldOfScienceAdapter) {}
    lp = new LinksPipe();
    adapt(item: any): Publication {
        const fieldsOfScience: FieldOfScience[] = [];
        item.fields_of_science.forEach(field => fieldsOfScience.push(this.fs.adapt(field)));

        const openAccess: boolean = (item.openAccessCode === 1 || item.openAccessCode === 2 || item.selfArchivedCode === 1) &&
                            this.lp.transform(item);

        return new Publication(
            +item.publicationId,
            item.publicationName,
            item.publicationYear,
            item.authorsText,
            item.author,
            +item.publicationOrgId,
            item.journalName,
            item.conferenceName,
            item.issn,
            item.issn2,
            item.volume,
            item.issueNumber,
            item.pageNumbersText,
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
            fieldsOfScience, // defined above
            item.keywords,
            openAccess, // defined above
            item.internationalCollaboration,
            item.publicationCountryCode,
            item.publicationLanguageCode,
            item.internationalCollaboration,
            item.businessCollaboration
        );
    }
}