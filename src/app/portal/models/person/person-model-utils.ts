// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { ModelUtilsService } from '@shared/services/model-util.service';

export class PersonModelUtils {
  constructor(private utils: ModelUtilsService) {}

  mapDataSources(data) {
    return data.dataSources
      .map((dataSource) =>
        this.utils.checkTranslation('name', dataSource.organization)
      )
      .join(', ');
  }
}
