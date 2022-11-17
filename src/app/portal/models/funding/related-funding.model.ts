// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Adapter } from '../adapter.model';
import { Injectable } from '@angular/core';
import { ModelUtilsService } from '@shared/services/model-util.service';

export class RelatedFunding {
  constructor(
    public typeOfFundingName: string,
    public typeOfFundingId: number,
    public shareOfFunding: number,
    public orgName: string,
    public orgId: string,
    public fundingStartYear: number,
    public fundingEndYear: number,
    public funderProjectNumber: string
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class RelatedFundingAdapter implements Adapter<RelatedFunding> {
  constructor(private utils: ModelUtilsService) {}
  adapt(item: any): RelatedFunding {
    return new RelatedFunding(
      this.utils.checkTranslation('typeOfFundingName', item),
      item.typeOfFundingId,
      item.shareOfFundingInEur,
      this.utils.checkTranslation('consortiumOrganizationName', item),
      item.consortiumOrganizationId,
      item.fundingStartYear,
      item.fundingEndYear,
      item.funderProjectNumber
    );
  }
}
