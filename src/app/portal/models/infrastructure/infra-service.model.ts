// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from '../adapter.model';
import { ServicePoint, ServicePointAdapter } from './service-point.model';
import { ModelUtilsService } from '@shared/services/model-util.service';
import { InfraContact, InfraLink } from '../../../infra-accordion/infra-accordion.component';

export interface InfraDate {
  year?: number | undefined;
  month?: number | undefined;
  day?: number | undefined;
}

export class InfraService {
  constructor(
    public serviceName: string,
    public serviceDescription: string,
    public serviceType: string,
    public servicePid: string,
    public startDate: InfraDate,
    public endDate: InfraDate,
    public targetSegment: string[],
    public targetAudience: string[],
    public homepage: string,
    public infraLinks: InfraLink[],
    public privacyPolicy: string,
    public termsOfUse: string,
    public instructionsOfUse: string,
    public serviceObtain:string,
    public contacts: InfraContact[]
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class InfraServiceAdapter implements Adapter<InfraService> {
  constructor(
    private spa: ServicePointAdapter,
    private utils: ModelUtilsService
  ) {}

  processInfraDate(input: any) {
    let retDate: InfraDate = {
      year: input?.year,
      month: input?.month,
      day: input?.day,
    }
    return retDate;
  }

  adapt(item: any): InfraService {
    const servicePoints: ServicePoint[] = [];

    item?.servicePoints?.forEach((sp) => {
      servicePoints.push(this.spa.adapt(sp));
    });

    return new InfraService(
      this.utils.checkTranslationFromArrayToString(item.serviceName),
      this.utils.checkTranslationFromArrayToString(item.serviceDescription),
      this.utils.translateInfraServiceType(item.serviceType),
      item.serviceKeyIdentifier,
      this.processInfraDate(item.serviceStartsOn),
      this.processInfraDate(item.serviceEndsOn),
      item.serviceTargetSegment.map(item => this.utils.filterTranslationFromElement(item?.codeLabel)),
      item.serviceUserRole.map(item => this.utils.filterTranslationFromElement(item?.codeLabel)),
      this.utils.checkTranslationFromArrayToString(item.serviceHomepage, 'weblinkURL'),
      this.utils.checkTranslationFromArrayToString(item.serviceBookingLink, 'weblinkURL'),
      this.utils.checkTranslationFromArrayToString(item.servicePrivacyPolicy, 'weblinkURL'),
      this.utils.checkTranslationFromArrayToString(item.serviceTermsOfUse, 'weblinkURL'),
      this.utils.checkTranslationFromArrayToString(item.serviceEndUserGuide, 'weblinkURL'),
      this.utils.checkTranslationFromArrayToString(item.serviceObtain),
      item.serviceContactInformation,
    );
  }
}
