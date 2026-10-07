// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { Adapter } from '../adapter.model';
import { InfraService, InfraServiceAdapter } from './infra-service.model';
import { ModelUtilsService } from '@shared/services/model-util.service';
import { UtilityService } from '@shared/services/utility.service';

export interface InfraContactInfo {
  contactLabel?: string | undefined;
  phone?: string[];
  email?: string[];
  street?: string | undefined;
  premise?: string | undefined;
  postalCode?: string | undefined;
  locality?: string | undefined;
  country?: string | undefined;
  countryCode?: string | undefined;
}

export class Infrastructure {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public scientificDescription: string,
    public startYear: string,
    public endYear: string,
    public acronym: string,
    public finlandRoadmap: string,
    public ESFRICodes: string,
    public contactInfo: InfraContactInfo[],
    public homepage: string,
    public terms: string,
    public urn: string,
    public responsibleOrganization: string,
    public responsibleOrganizationId: string,
    public participantOrganizations: string,
    public statCenterId: string,
    public replacingInfraStructure: string,
    public fieldsOfScience: object[],
    public services: InfraService[],
    public keywordsString: string,
    public fieldsOfScienceString: string
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class InfrastructureAdapter implements Adapter<Infrastructure> {
  infraContactInfo: InfraContactInfo[] = [];
  constructor(@Inject(LOCALE_ID) protected localeId: string,
    private isa: InfraServiceAdapter,
    private utils: ModelUtilsService
  ) {}

  adapt(item: any): Infrastructure {
    this.infraContactInfo = [];
    const capitalizedLocale =
      this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);

    const services: InfraService[] = [];
    const fieldsOfScience: string[] = [];

    item.infraConPoint = item.infraConPoint?.shift();

    // Init and assign if available
    let responsibleOrganization = '';
    let responsibleOrganizationId = '';
    if (item.infraResponsibleOrganization) {
      // TODO: fix to use localized values
      responsibleOrganization = item.infraResponsibleOrganization?.organizationName?.fi ?? '';
      responsibleOrganizationId = item.infraResponsibleOrganization?.organizationIdentifier[0]?.pidContent ?? '';
    }

    let participantOrganization = '';
    let participantOrganizationId = '';
    if (item.participantOrganization) {
      // TODO: fix to use localized values
      participantOrganization = item.infraParticipantOrganizations?.organizationName?.fi ?? '';
      participantOrganizationId = item.infraParticipantOrganizations?.organizationIdentifier[0]?.pidContent ?? '';
    }

    let participantOrganizations = '';
    const orgList = [];
    if (item.participantOrganizations) {
      item.participantOrganizations.forEach((org) => {
        orgList.push(
          this.utils.checkTranslation('participantOrganizationName', org).trim()
        );
      });
    }
    participantOrganizations = orgList.join(', ');

    if (item?.infraContactInformation) {
      item.infraContactInformation.forEach(contactElement => {
        let infraContact: InfraContactInfo = {};
        infraContact.contactLabel = contactElement?.contactLabel ?? '';
        infraContact.phone = contactElement?.phone ?? [];
        infraContact.email = contactElement?.email ?? [];
        infraContact.street = contactElement?.street ?? '';
        infraContact.premise = contactElement?.premise ?? '';
        infraContact.postalCode = contactElement?.postalCode ?? '';
        infraContact.locality = contactElement?.locality ?? '';
        infraContact.country = contactElement?.country ?? '';
        infraContact.countryCode = contactElement?.countryCode ?? '';
        this.infraContactInfo.push(infraContact);
      })
    }

    item.infraServices?.forEach((service) => services.push(this.isa.adapt(service)));
    item.fieldsOfScience?.forEach((obj) =>
      fieldsOfScience.push(this.utils.checkTranslation('name', obj))
    );

    const keywords = []
      .concat(item.keywords, item.keywordsEn, item.keywordsSv)
      .filter((item) => item && item.keyword.trim().length > 0)
      .map((item) => item.keyword)
      .join(', ');

    const fieldsOfScienceString = fieldsOfScience?.join(', ');

    return new Infrastructure(
      item?.infraKeyIdentifier?.substring(11, item?.infraKeyIdentifier?.length),
      this.utils.checkTranslationFromArrayToString(item.infraName),
      this.utils.checkTranslationFromArrayToString(item.infraDescription),
      this.utils.checkTranslation('scientificDescription', item),
      item?.infraStartsOn?.year ?? '',
      item?.infraEndsOn?.year ?? '',
      item?.infraAcronym ?? '',
      item?.finlandRoadmap,
      item?.ESFRICodes ? item.ESFRICodes.map(item => this.utils.filterTranslationFromElement(item?.codeLabel)).join(', ') : '',
      this.infraContactInfo,
      this.utils.checkTranslationFromArrayToString(item?.infraHomepage, 'weblinkURL'),
      this.utils.checkTranslation('infraConTerms', item?.infraConPoint),
      item?.infraKeyIdentifier,
      this.utils.filterTranslationFromElement(item?.infraResponsibleOrganization?.organizationName),
      item?.infraResponsibleOrganization?.orgNodeId ?? '',
      participantOrganizations,
      item.orgNodeId,
      item.replacingInfraStructure,
      item?.fieldOfScience ? item.fieldOfScience.map(item => this.utils.filterTranslationFromElement(item?.codeLabel)) : [],
      services,
      keywords,
      fieldsOfScienceString
    );
  }
}
