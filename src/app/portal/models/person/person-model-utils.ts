// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { ModelUtils } from '../utils';

export class PersonModelUtils {
  constructor(private utils: ModelUtils) {}

  mapDataSources(data) {
    return data.dataSources
      .map((dataSource) =>
        this.utils.checkTranslation('name', dataSource.organization)
      )
      .join(', ');
  }
}
