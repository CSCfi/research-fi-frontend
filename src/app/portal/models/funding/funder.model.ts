// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Adapter } from '../adapter.model';
import { Injectable } from '@angular/core';
import { ModelUtilsService } from '@shared/services/model-util.service';

export class Funder {
  constructor(
    public name: string,
    public nameUnd: string,
    public typeOfFundingId: string,
    public typeOfFundingName: string,
    public callProgrammeName: string,
    public callProgrammeNameUnd: string,
    public callProgrammeHomePage: string,
    public frameworkProgramme: string,
    public euCallProgrammes: { name: string; id: string }[],
    public topicName: string,
    public topicId: string,
    public euCallId: string,
    public businessId: string
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class FunderAdapter implements Adapter<Funder> {
  constructor(private utils: ModelUtilsService) {}
  adapt(item: any): Funder {
    const callProgrammes: { name: string; id: string }[] = [];

    item?.callProgrammes?.forEach((p) => {
      callProgrammes.push({
        name: this.utils.checkTranslation('callProgrammeName', p),
        id: p?.callProgrammeId,
      });
    });

    return new Funder(
      this.utils.checkTranslation('funderName', item),
      item.funderNameUnd,
      item.typeOfFundingId,
      this.utils.checkTranslation('typeOfFundingName', item)?.trim().length > 0
        ? this.utils.checkTranslation('typeOfFundingName', item)
        : item.typeOfFundingId,
      this.utils.checkTranslation('callProgrammeName', item),
      item.callProgrammeNameUnd,
      item.callProgrammeHomePage,
      this.utils.checkTranslation(
        'frameworkProgrammeName',
        item?.frameworkProgramme?.slice(0).pop()
      ),
      callProgrammes,
      this.utils.checkTranslation('topicName', item),
      item?.topicId,
      item?.euCallId,
      item.funderBusinessId ? item.funderBusinessId[0].pid_content : null
    );
  }
}
