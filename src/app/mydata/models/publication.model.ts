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
    item.publicationGroups.forEach(
      (group) =>
        (group.items = group.items.map(
          (item) =>
            (item = {
              ...this.publicationAdapter.adapt(item),
              itemMeta: item.itemMeta,
            })
        ))
    );

    // Sort publication groups by ORCID publications first
    // Order needs to be constant for merging publications in mydata/utils.ts
    item.publicationGroups = item.publicationGroups.sort(
      (
        a: { groupMeta: { type: number } },
        b: { groupMeta: { type: number } }
      ) => b.groupMeta.type - a.groupMeta.type
    );

    return new PublicationFields(
      this.mydataUtils.mapGroup(
        item.publicationGroups,
        'publications',
        $localize`:@@publications:Julkaisut`
      )
    );
  }
  adaptNew(item: any): PublicationFields {
    return new PublicationFields(
      this.mydataUtils.mapGroupGeneralNew(
        item,
        'publication',
        'publications',
        $localize`:@@publications:Julkaisut`
      )
    );
  }
}
