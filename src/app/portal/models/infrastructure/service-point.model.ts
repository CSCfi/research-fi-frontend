// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from '../adapter.model';
import { LanguageCheck } from '../utils';

export class ServicePoint {
  constructor(
    public name: string,
    public description: string,
    public visitingAddress: string,
    public phoneNumber: string,
    public emailAddress: string,
    public infoUrl: ServicePoint[],
    public accessPolicyUrl: string,
    public internationalInfraUrl: string
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class ServicePointAdapter implements Adapter<ServicePoint> {
  constructor(private lang: LanguageCheck) {}
  adapt(item: any): ServicePoint {
    return new ServicePoint(
      this.lang.testLang('servicePointName', item),
      this.lang.testLang('servicePointDescription', item),
      item.servicePointVisitingAddress,
      item.servicePointPhoneNumber,
      item.servicePointEmailAddress,
      this.lang.testLang('servicePointInfoUrl', item),
      this.lang.testLang('servicePointAccessPolicyUrl', item),
      item.servicePointInternationalInfraUrl
    );
  }
}
