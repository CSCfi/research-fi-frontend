// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from '../adapter.model';
import { ModelUtilsService } from '@shared/services/model-util.service';

export class ServicePoint {
  constructor(
    public name: string,
    public description: string,
    public visitingAddress: string,
    public phoneNumber: string,
    public emailAddress: string,
    public infoUrl: ServicePoint[],
    public accessPolicyUrl: string,
    public internationalInfraUrl: string,
    public urn: string
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class ServicePointAdapter implements Adapter<ServicePoint> {
  constructor(private utils: ModelUtilsService) {}
  adapt(item: any): ServicePoint {
    return new ServicePoint(
      this.utils.checkTranslation('servicePointName', item),
      this.utils.checkTranslation('servicePointDescription', item),
      item.servicePointVisitingAddress,
      item.servicePointPhoneNumber,
      item.servicePointEmailAddress,
      this.utils.checkTranslation('servicePointInfoUrl', item),
      this.utils.checkTranslation('servicePointAccessPolicyUrl', item),
      item.servicePointInternationalInfraUrl,
      item.urn
    );
  }
}
