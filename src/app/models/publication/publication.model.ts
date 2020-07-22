// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT
import { FieldOfScience, FieldOfScienceAdapter } from './field-of-science.model';
import { Injectable } from '@angular/core';
import { Adapter } from '../adapter.model';
import { PublicationCitationAdapter } from './publication-citation.model';

export class Publication {
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
        public fieldsOfScienceString: string,
        public author: any[],
        public selfArchivedData: any,
        public completions: string[],
        public publicationChannel: string,
        public citations: string[]
    ) {}
}

@Injectable({
    providedIn: 'root'
})
export class PublicationAdapter implements Adapter<Publication> {
    constructor(private fs: FieldOfScienceAdapter, private citationAdapter: PublicationCitationAdapter) {}
    adapt(item: any): Publication {
        let fieldsOfScience: FieldOfScience[] = [];
        // All items don't have field_of_science field
        item.fields_of_science ? item.fields_of_science.forEach(field => fieldsOfScience.push(this.fs.adapt(field))) : fieldsOfScience = [];

        // Only include fields with id
        fieldsOfScience = fieldsOfScience.filter(x => x.id);
        // Create string from array
        const fieldsOfScienceString = fieldsOfScience.map(x => x.name).join('; ')

        // Publication citations
        const citationsObject = this.citationAdapter.adapt(item);
        const citations = [citationsObject.apa, citationsObject.chicago, citationsObject.mla];

        const openAccess: boolean = (item.openAccessCode === 1 || item.openAccessCode === 2 || item.selfArchivedCode === 1);
        let openAccessText = '';
        // Open Access can be added from multiple fields
        if ((item.openAccessCode === 1 || item.openAccessCode === 2) || item.selfArchivedCode === 1) {
            openAccessText = $localize`:@@yes:Kyllä`;
        } else if (item.openAccessCode === 0  && item.selfArchivedCode === 0) {
            openAccessText = $localize`:@@no:Ei`;
        } else {
            openAccessText = $localize`:@@noInfo:Ei tietoa`;
        }

        if (item.selfArchivedData) {
            item.selfArchivedAddress = item.selfArchivedData[0]?.selfArchived[0]?.selfArchivedAddress;
            // Check for empty addresses
            item.selfArchivedData[0].selfArchived = item.selfArchivedData[0].selfArchived
            .filter(x => x.selfArchivedAddress.trim().length > 0);
        }

        // Prioritize publication channel
        let channel = '';
        if (item.journalName?.trim()?.length) {
            channel = item.journalName;
        } else if (item.conferenceName?.trim()?.length) {
            channel = item.conferenceName;
        } else if (item.publisherName?.trim()?.length) {
            channel = item.publisherName;
        } else {
            channel = '-';
        }

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
            fieldsOfScienceString,
            item.author,
            item.selfArchivedData,
            item.completions,
            channel,
            citations
        );
    }
}
