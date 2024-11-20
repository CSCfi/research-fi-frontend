// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from '../adapter.model';
import { ModelUtilsService } from '@shared/services/model-util.service';

export class Project {
  constructor(
    public id: string,
    public source_id: string,
    public name: string,
    public summary: string,
    public additionalInformation: string,
    public goals: string,
    public abbreviation: string,
    public outcomeEffect: string,
    public startYear: string,
    public endYear: string,
    public projectURL: string,
    public responsibleOrganizations: object[],
    public responsibleOrganization: string,
    public responsiblePerson: object[],
    public keywords: string,
    public completions: object[]
  ) {
  }
}

@Injectable({
  providedIn: 'root'
})
export class ProjectAdapter implements Adapter<Project> {
  constructor(private utils: ModelUtilsService) {
  }

  adapt(item: any): Project {

    const respOrgList = [];
    if (item.responsibleOrganization) {
      item.responsibleOrganization.forEach((org) => {
        respOrgList.push({
            orgName: this.utils.checkTranslation('orgName', org).trim(),
            orgId: org.orgId
          }
        );
      });
    }

    const respOrgStr = respOrgList.map(org => org.orgName).join(', ');
    const keywords = item?.keywords ? item.keywords.filter((item) => item?.keyword && item.keyword.trim().length > 0).map(kw => kw.keyword.replace(/,$/, '')).join(', ') : '';

    return new Project(
      item.id,
      item.source_id,
      this.utils.checkTranslation('name', item),
      this.utils.checkTranslation('summary', item),
      this.utils.checkTranslation('additionalInformation', item),
      this.utils.checkTranslation('goals', item),
      item.abbreviation,
      this.utils.checkTranslation('outcomeEffect', item),
      item.startYear,
      item.endYear,
      item.projectURL,
      respOrgList,
      respOrgStr,
      item.responsiblePerson,
      keywords,
      item?.completions ? item.completions : []
    );
  }
}
