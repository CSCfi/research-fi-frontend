// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Injectable, Inject, LOCALE_ID } from '@angular/core';
import { Adapter } from './adapter.model';
import { ModelUtilsService } from '@shared/services/model-util.service';

export class Organization {
  constructor(
    public id: string,
    public name: string,
    public nameTranslations: object | string,
    public variantNames: string,
    public established: string,
    public background: string,
    public predecessors: string,
    public related: string,
    public organizationType: string,
    public homepage: string,
    public visitingAddress: string,
    public postalAddress: string,
    public businessId: string,
    public statCenterId: string,
    public sectorName: string,
    public staffCountAsFte: number,
    public staffCountAsPercentage: number,
    public staffYear: string,
    public thesisYear: string,
    public thesisCountBsc: string,
    public thesisCountMsc: string,
    public thesisCountLic: string,
    public thesisCountPhd: string,
    public thesisCountBscPercentage: number,
    public thesisCountMscPercentage: number,
    public thesisCountLicPercentage: number,
    public thesisCountPhdPercentage: number,
    public sectorNameFi: string,
    public subUnits: any[],
    public logo: string,
    public visualIframeUrl: string
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class OrganizationAdapter implements Adapter<Organization> {
  constructor(
    private utils: ModelUtilsService,
    @Inject(LOCALE_ID) protected localeId: string
  ) {}
  adapt(item: any): Organization {
    const locale =
      this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
    // Name translations
    const nameTranslations = (({ nameFi, nameEn, nameSv }) => ({
      nameFi,
      nameEn,
      nameSv,
    }))(item);
    const key = 'name' + locale;
    delete nameTranslations[key];

    // Join predecessors with comma
    const predecessors = item.predecessors
      ? item.predecessors.map((x) => x.nameFi.trim()).join(', ')
      : '';
    const related = item.related
      ? item.related.map((x) => x.nameFi.trim()).join(', ')
      : '';

    return new Organization(
      item.organizationId,
      this.utils.checkTranslation('name', item).trim(),
      nameTranslations,
      item.variantNames,
      item.established,
      item.organizationBackground,
      predecessors,
      related,
      item.organizationType,
      item.homepage,
      item.visitingAddress,
      item.postalAddress,
      item.businessId,
      item.TKOppilaitosTunnus,
      this.utils.checkTranslation('sectorName', item),
      item.staffCountAsFte,
      item.staffCountAsPercentage,
      item.staffYear,
      item.thesisYear,
      item.thesisCountBsc,
      item.thesisCountMsc,
      item.thesisCountLic,
      item.thesisCountPhd,
      item.thesisCountBscPercentage,
      item.thesisCountMscPercentage,
      item.thesisCountLicPercentage,
      item.thesisCountPhdPercentage,
      item.sectorNameFi,
      item.subUnits,
      item.mediaUri,
      null // Initial value for organization visual iFrame url
    );
  }
}
