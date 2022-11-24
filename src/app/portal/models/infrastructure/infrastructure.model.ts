// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from '../adapter.model';
import { InfraService, InfraServiceAdapter } from './infra-service.model';
import { ModelUtilsService } from '@shared/services/model-util.service';

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
    public ESFRICode: string,
    public merilCode: string,
    public contactName: string,
    public contactDescription: string,
    public email: string,
    public phoneNumber: string,
    public address: string,
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
  constructor(
    private isa: InfraServiceAdapter,
    private utils: ModelUtilsService
  ) {}
  adapt(item: any): Infrastructure {
    const services: InfraService[] = [];
    const fieldsOfScience: string[] = [];

    item.infraConPoint = item.infraConPoint?.shift();

    // Init and assign if available
    let responsibleOrganization = '';
    let responsibleOrganizationId = '';
    if (item.responsibleOrganization) {
      responsibleOrganization = this.utils.checkTranslation(
        'responsibleOrganizationName',
        item.responsibleOrganization[0]
      );
      responsibleOrganizationId =
        item.responsibleOrganization[0]?.TKOppilaitosTunnus;
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

    // Assign if available
    const esfriCode =
      item.ESFRICodes?.length > 0
        ? item.ESFRICodes.map((x) => x.ESFRICode)[0]
        : '';

    item.services?.forEach((service) => services.push(this.isa.adapt(service)));
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
      item.nameFi,
      this.utils.checkTranslation('name', item),
      this.utils.checkTranslation('description', item),
      this.utils.checkTranslation('scientificDescription', item),
      item.startYear,
      item.endYear,
      item.acronym,
      item.finlandRoadmap,
      esfriCode,
      item.merilCode,
      this.utils.checkTranslation('infraConName', item?.infraConPoint),
      this.utils.checkTranslation('infraConDescr', item?.infraConPoint),
      item?.infraConPoint?.infraConEmail,
      item?.infraConPoint?.infraConPhone,
      item?.infraConPoint?.infraConPost,
      this.utils.checkTranslation('infraConInfo', item?.infraConPoint),
      this.utils.checkTranslation('infraConTerms', item?.infraConPoint),
      item.urn,
      responsibleOrganization,
      responsibleOrganizationId,
      participantOrganizations,
      item.TKOppilaitosTunnus,
      item.replacingInfraStructure,
      item.fieldsOfScience,
      services,
      keywords,
      fieldsOfScienceString
    );
  }
}
