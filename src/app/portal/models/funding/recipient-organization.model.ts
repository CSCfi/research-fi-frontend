// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Adapter } from '../adapter.model';
import { Injectable } from '@angular/core';
import { ModelUtilsService } from '@shared/services/model-util.service';

export class RecipientOrganization {
  constructor(
    public id: string,
    public businessId: string,
    public name: string,
    public role: string,
    public shareOfFundingEur: number,
    public pic: string,
    public countryCode: string,
    public sectorId: string,
    public finnishOrganization: boolean,
    public portalEquivalent: boolean
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class RecipientOrganizationAdapter
  implements Adapter<RecipientOrganization>
{
  constructor(private utils: ModelUtilsService) {}
  adapt(item: any): RecipientOrganization {
    // Trim all string elements
    if (item) {
      Object.keys(item).map(
        (k) =>
          (item[k] = typeof item[k] === 'string' ? item[k].trim() : item[k])
      );
    }

    const portalEquivalentOrganizationFields = [
      item.consortiumOrganizationId,
      item.consortiumOrganizationPic,
      item.consortiumSectorId,
    ];

    return new RecipientOrganization(
      item.consortiumOrganizationId,
      item.consortiumOrganizationBusinessId,
      this.utils.checkTranslation('consortiumOrganizationName', item),
      this.utils.translateRole(item.roleInConsortium, item.euFunding),
      item.shareOfFundingInEur,
      item.consortiumOrganizationPic,
      item.consortiumOrganizationCountryCode,
      item.consortiumSectorId,
      item.isFinnishOrganization === 1,
      portalEquivalentOrganizationFields.every((field) => field?.length)
    );
  }
}
