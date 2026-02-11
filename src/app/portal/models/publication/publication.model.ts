// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT
import {
  FieldOfScience,
  FieldOfScienceAdapter,
} from './field-of-science.model';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { Adapter } from '../adapter.model';
import { PublicationCitationAdapter } from './publication-citation.model';
import { ModelUtilsService } from '@shared/services/model-util.service';

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
    public artPublicationTypeCategories: string[],
    public artPublicationFieldsOfArt: string[],
    public artPublicationTypeCategoriesString,
    public artPublicationFieldsOfArtString,
    public artPublicationEvent: string,
    public artPublicationVenue: string,
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
    public publicationStatusText: string,
    public apcFee: string,
    public apcPaymentYear: string,
    public openAccess: boolean,
    public abstract: string,
    public openAccessText: string,
    public articleTypeText: string,
    public internationalPublication: number | string,
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
    public citations: string[],
    public identifiedTopic?: string[],
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class PublicationAdapter implements Adapter<Publication> {
  capitalizedLocale: string;
  constructor(
    private utils: ModelUtilsService,
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

    // Remove (artificial) art publication fields from field of science (same info presented in fieldsOfArt field)
    fieldsOfScience = fieldsOfScience.filter(
      (x) => !x.id.toString().startsWith('8')
    );

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

    let archiveCodeText: string;
    if (item.selfArchivedCode === "1") {
      archiveCodeText = $localize`:@@yes:Kyllä`;
    } else if (item.selfArchivedCode === "0") {
      archiveCodeText = $localize`:@@no:Ei`;
    } else {
      archiveCodeText = $localize`:@@unknown:Ei tietoa`;
    }

    let articleTypeText = '';
    if (item.articleTypeCode != null) {
      switch (item.articleTypeCode) {
        case 0:
          articleTypeText = $localize`:@@otherArticle:Muu artikkeli`;
          break;
        case 1:
          articleTypeText = $localize`:@@originalArticle:Alkuperäisartikkeli`;
          break;
        case 2:
          articleTypeText = $localize`:@@reviewArticle:Katsausartikkeli`;
          break;
        case 3:
          articleTypeText = $localize`:@@dataArticle:Data-artikkeli`;
          break;
        default:
          articleTypeText = '';
      }
    }

    //Abstract
    let abstract = item.abstract || '';

    // Open Access
    const openAccess: boolean =
      item.openAccess === 1 || item.selfArchivedCode === "1";

    let openAccessText = '';

    if (item.openAccess === 1) {
      openAccessText = $localize`:@@yes:Kyllä`;
    } else if (item.openAccess === 0) {
      openAccessText = $localize`:@@no:Ei`;
    } else {
      openAccessText = $localize`:@@noInfo:Ei tietoa`;
    }

    //For Open Access box
    let publisherOpenAccessText = '';
    switch (item.publisherOpenAccessCode) {
      case 1:
        publisherOpenAccessText = $localize`:@@OaFullyOpen:Kokonaan avoin julkaisukanava`;
        break;
      case 2:
        publisherOpenAccessText = $localize`:@@OaPartiallyOpen:Osittain avoin julkaisukanava`;
        break;
      case 3:
        publisherOpenAccessText = $localize`:@@OaDelayed:Viivästetysti avoin julkaisukanava`;
        break;
    }

    let licenseText = this.utils.checkTranslation(
      'licenseName',
      item?.license?.slice()?.shift()
    );
    let archiveCodeVersionText = '';

    let publicationStatusText = '';
    if (
      Number(item.publicationStatusCode) === 1 ||
      Number(item.publicationStatusCode) === 2 ||
      Number(item.publicationStatusCode) === 9
    ) {
      publicationStatusText = $localize`:@@yes:Kyllä`;
    } else {
      publicationStatusText = $localize`:@@no:Ei`;
    }

    let archiveCodeLincenseText = '';
    let apcFee = '';
    let publicationType = item.publicationTypeCode?.split('')[0];
    let embargoDate = '';
    let archiveEmbargoDate = '';

    if (['A', 'B'].includes(publicationType) && item.apcFeeEur) {
      item.apcFeeEur > 6000 ||
      item.openAccessCode === 0 ||
      item.openAccess === 0 ||
      (item.openAccess === 1 && item.publisherOpenAccessCode === 0)
        ? ''
        : (apcFee = item.apcFeeEur);
    } else if (['C'].includes(publicationType) && item.apcFeeEur) {
      item.apcFeeEur > 25000 ||
      item.openAccessCode === 0 ||
      item.openAccess === 0 ||
      (item.openAccess === 1 && item.publisherOpenAccessCode === 0)
        ? ''
        : (apcFee = item.apcFeeEur);
    }

    let apcPaymentYear = '';
    apcFee !== '' ? (apcPaymentYear = item.apcPaymentYear) : '';

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

      archiveCodeLincenseText =
        item.selfArchivedData[0]?.selfArchived[0]?.selfArchivedLicenseNameFi;

      if (
        item.selfArchivedData[0]?.selfArchived[0]?.selfArchivedVersionCode === 1
      ) {
        archiveCodeVersionText = $localize`:@@publisherVersion:Kustantajan versio`;
      } else if (
        item.selfArchivedData[0]?.selfArchived[0]?.selfArchivedVersionCode === 0
      ) {
        archiveCodeVersionText = $localize`:@@finalDraft:Viimeinen käsikirjoitusversio`;
      }

      if (item.selfArchivedData[0]?.selfArchived[0]?.selfArchivedEmbargoDate) {
        embargoDate =
          item.selfArchivedData[0]?.selfArchived[0]?.selfArchivedEmbargoDate?.trim();
        if (embargoDate) {
          let date = embargoDate.split('-');

          const day = date[0];
          const month = date[1];
          const year = date[2];

          const parsedDate = Date.parse(`${year}-${month}-${day}`);

          if (parsedDate > Date.now()) {
            archiveEmbargoDate = `${day}.${month}.${year}`;
          }
        }
      }
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

    // Optional art publication fields
    let artPublicationTypeCategoriesString: string;
    const artPublicationTypeCategories: string[] = [];
    if (item?.artPublicationTypeCategory) {
      item.artPublicationTypeCategory.forEach((item) => {
        artPublicationTypeCategories.push(
          this.utils.checkTranslation('typeCategoryName', item)
        );
      });
    }
    artPublicationTypeCategoriesString =
      artPublicationTypeCategories.join('; ');

    let fieldsOfArt: string[] = [];
    let artPublicationFieldsOfArtString: string;
    item.fieldsOfArt
      ? item.fieldsOfArt.forEach((field) => {
          fieldsOfArt.push(this.utils.checkTranslation('nameArt', field));
        })
      : (fieldsOfArt = []);
    artPublicationFieldsOfArtString = fieldsOfArt.join('; ');

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
      artPublicationTypeCategories,
      fieldsOfArt,
      artPublicationTypeCategoriesString,
      artPublicationFieldsOfArtString,
      item?.artPublication?.event ? item.artPublication.event : null,
      item?.artPublication?.venue ? item.artPublication.venue : null,
      item.isbn,
      item.isbn2,
      item.publisherName,
      item.publisherLocation,
      item.jufoCode,
      item.jufoClassCode,
      item.doi,
      item.doiHandle?.trim().length > 0 ? item.doiHandle : null,
      item.selfArchivedAddress,
      item.keywords,
      archiveCodeText,
      publisherOpenAccessText,
      licenseText,
      archiveCodeVersionText,
      archiveCodeLincenseText,
      archiveEmbargoDate,
      publicationStatusText,
      apcFee,
      apcPaymentYear,
      openAccess, // defined above
      abstract,
      openAccessText,
      articleTypeText,
      item.internationalPublication,
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
      citations,
      item.identifiedTopic
    );
  }
}
