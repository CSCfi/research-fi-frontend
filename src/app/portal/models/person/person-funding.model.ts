// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Adapter } from '../adapter.model';
import { Injectable } from '@angular/core';
import { ModelUtilsService } from '@shared/services/model-util.service';

export class PersonFunding {
  constructor(
    public id: string,
    public name: string,
    public funderName: string,
    public year: string
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class PersonFundingAdapter implements Adapter<PersonFunding> {
  constructor(private utils: ModelUtilsService) {}

  adapt(funding: any): PersonFunding {
    const getYearRange = () => {
      return [funding.fundingStartYear, funding.fundingEndYear].join(' - ');
    };

    return new PersonFunding(
      funding.projectId,
      this.utils.checkTranslation('projectName', funding),
      this.utils.checkTranslation('funderName', funding),
      getYearRange()
    );
  }
}
