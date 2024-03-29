// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Injectable } from '@angular/core';
import { MydataUtilityService } from '@mydata/services/mydata-utility.service';
import { Adapter } from './adapter.model';

export class EducationFields {
  constructor(public education: any) {}
}

@Injectable({
  providedIn: 'root',
})
export class EducationFieldsAdapter implements Adapter<EducationFields> {
  constructor(private mydataUtils: MydataUtilityService) {}

  // adaptOld(item: any): EducationFields {
  //   return new EducationFields(
  //     this.mydataUtils.mapGroup(
  //       item.educationGroups,
  //       'education',
  //       $localize`:@@education:Koulutus`
  //     )
  //   );
  // }

  adapt(item: any): EducationFields {
    return new EducationFields(
      this.mydataUtils.mapGroupGeneral(
        item,
        'education',
        'educations',
        $localize`:@@education:Koulutus`
      )
    );
  }
}
