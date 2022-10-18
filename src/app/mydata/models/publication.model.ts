// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Injectable } from '@angular/core';
import { MydataUtilityService } from '@mydata/services/mydata-utility.service';
import { Adapter } from './adapter.model';
import { PublicationAdapter } from '@portal/models/publication/publication.model';

export class PublicationFields {
  constructor(public publication: any) {}
}

@Injectable({
  providedIn: 'root',
})
export class PublicationFieldsAdapter implements Adapter<PublicationFields> {
  constructor(
    private publicationAdapter: PublicationAdapter,
    private mydataUtils: MydataUtilityService
  ) {}

  adapt(item: any): PublicationFields {
    /*
     * Leverage model from Portal.
     */
    item.publications = item.publications.map((publication) => ({
      ...this.publicationAdapter.adapt(publication),
      ...publication,
    }));

    //   // Sort publication groups by ORCID publications first
    //   // Order needs to be constant for merging publications in mydata/utils.ts
    //   item.publicationGroups = item.publicationGroups.sort(
    //     (
    //       a: { groupMeta: { type: number } },
    //       b: { groupMeta: { type: number } }
    //     ) => b.groupMeta.type - a.groupMeta.type
    //   );

    return new PublicationFields(
      this.mydataUtils.mapGroupGeneral(
        item,
        'publication',
        'publications',
        $localize`:@@publications:Julkaisut`
      )
    );
  }
}
