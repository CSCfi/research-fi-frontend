// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT
import {
  FieldOfScience,
  FieldOfScienceAdapter,
} from './field-of-science.model';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { Adapter } from '../adapter.model';
import { PublicationCitationAdapter } from './publication-citation.model';
import { LanguageCheck } from '../utils';

export class Publication {
  constructor(
    public id: string, // publicationId
    public title: string, // publicationName
    public publicationYear: number,
    public publicationTypeCode: string,
    public authors: string, // authorsText
    public organizationId: number, // publicationOrgId
    public format: string,
    public audience: string,
    public parentPublicationType: string,
    public peerReviewed: string,
    public journalName: string,
    public conferenceName: string,
    public issn: string,
    public issn2: string,
    public volume: string,
    public issueNumber: string,
    public pageNumbers: string, // pageNumberText
    public articleNumber: string, // articleNumberText
    public parentPublicationName: string,
    public parentPublicationPublisher: string,
    public isbn: string,
    public isbn2: string,
    public publisherName: string,
    public publisherLocation: string,
    public jufoCode: string,
    public jufoClassCode: string,
    public doi: string,
    public doiHandle: string,
    public selfArchivedAddress: string,
    public keywords: any,
    public archiveCodeText: string,
    public publisherOpenAccessText: string,
    public licenseText: string,
    public archiveCodeVersionText: string,
    public archiveCodeLincenseText: string,
    public archiveEbargoDate: string,
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
    public selfArchivedData: any[],
    public completions: string[],
    public publicationChannel: string,
    public citations: string[]
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class PublicationAdapter implements Adapter<Publication> {
  capitalizedLocale: string;
  constructor(
    private fs: FieldOfScienceAdapter,
    private citationAdapter: PublicationCitationAdapter,
    @Inject(LOCALE_ID) protected localeId: string
  ) {
    this.capitalizedLocale =
      this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
  }
  adapt(item: any): Publication {
    let fieldsOfScience: FieldOfScience[] = [];
    // All items don't have field_of_science field
    item.fieldsOfScience
      ? item.fieldsOfScience.forEach((field) =>
          fieldsOfScience.push(this.fs.adapt(field))
        )
      : (fieldsOfScience = []);

    // Only include fields with id
    fieldsOfScience = fieldsOfScience.filter((x) => x.id);
    // Create string from array
    const fieldsOfScienceString = fieldsOfScience.map((x) => x.name).join('; ');

    let citations: string[] = [];
    // Publication citations
    if (!item.doi) {
      const citationsObject = this.citationAdapter.adapt(item);
      citations = [
        citationsObject.apa,
        citationsObject.chicago,
        citationsObject.mla,
      ];
    }

    let archiveCodeText = '';
    if (item.selfArchivedCode === 1) {
      archiveCodeText = $localize`:@@yes:Kyllä`;
    } else {
      archiveCodeText = $localize`:@@no:Ei`;
    }

    const openAccess: boolean =
      item.openAccessCode === 1 ||
      item.openAccessCode === 2 ||
      item.openAccess === true;
    let openAccessText = '';
    // Open Access can be added from multiple fields
    if (
      item.openAccessCode === 1 ||
      item.openAccessCode === 2 ||
      item.openAccess === true
    ) {
      openAccessText = $localize`:@@yes:Kyllä`;
    } else if (item.openAccessCode === 0 && item.openAccess === false) {
      openAccessText = $localize`:@@no:Ei`;
    } else {
      openAccessText = $localize`:@@noInfo:Ei tietoa`;
    }

    //For Open Access box
    let publisherOpenAccessText = '';
    //Lisää kieliversiot
    if (item.openAccessCode === 1 || item.publisherOpenAccessCode === 1) {
      publisherOpenAccessText = $localize`Kokonaan avoin julkaisukanava`;
    } else if (
      item.openAccessCode === 2 ||
      item.publisherOpenAccessCode === 2
    ) {
      publisherOpenAccessText = $localize`Osittain avoin julkaisukanava`;
    } else {
      publisherOpenAccessText = $localize`Viivästetysti avoin julkaisukanava`;
    }

    let licenseText = '--';
    let archiveCodeVersionText = '--';
    let archiveCodeLincenseText = '--';

    let embargoDate = '';
    let archiveEbargoDate = '';
    if (item.selfArchivedData[0].selfArchived[0].selfArchivedEmbargoDate) {
      embargoDate =
        item.selfArchivedData[0].selfArchived[0].selfArchivedEmbargoDate;
      let pvm = '';
      embargoDate.split('').every(function (item) {
        if (item != 'T') {
          pvm += item;
          return true;
        } else {
          return false;
        }
      });
      let pvm2 = pvm.split('-');
      archiveEbargoDate = pvm2[2] + '.' + pvm2[1] + '.' + pvm2[0];
    }

    if (item.selfArchivedData) {
      item.selfArchivedAddress =
        item.selfArchivedData[0]?.selfArchived[0]?.selfArchivedAddress;
      // Check for empty addresses
      item.selfArchivedData[0].selfArchived =
        item.selfArchivedData[0].selfArchived.filter(
          (x) => x.selfArchivedAddress.trim().length > 0
        );
      // Filter empty items
      item.selfArchivedData = item.selfArchivedData.filter(
        (x) => x.selfArchived.length
      );
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

    // Trim finnish organization names. These come often with trailing white space
    if (item.author) {
      item.author.forEach((sector) => {
        sector.organization.map(
          (org) => (org.OrganizationNameFi = org.OrganizationNameFi.trim())
        );
      });
    }

    // Check if publication type fields exist
    const publicationFormat = item.publicationFormat
      ? item.publicationFormat[0][
          'name' + this.capitalizedLocale + 'PublicationFormat'
        ]
      : undefined;
    const publicationAudience = item.publicationAudience
      ? item.publicationAudience[0][
          'name' + this.capitalizedLocale + 'PublicationAudience'
        ]
      : undefined;
    const parentPublicationType = item.parentPublicationType
      ? item.parentPublicationType[0][
          'name' + this.capitalizedLocale + 'ParentPublicationType'
        ]
      : undefined;
    const peerReviewed = item.peerReviewed
      ? item.peerReviewed[0]['name' + this.capitalizedLocale + 'PeerReviewed']
      : undefined;

    return new Publication(
      item.publicationId,
      item.publicationName,
      item.publicationYear,
      item.publicationTypeCode,
      item.authorsText,
      +item.publicationOrgId,
      publicationFormat,
      publicationAudience,
      parentPublicationType,
      peerReviewed,
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
      archiveCodeText,
      publisherOpenAccessText,
      licenseText,
      archiveCodeVersionText,
      archiveCodeLincenseText,
      archiveEbargoDate,
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
