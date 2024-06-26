//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';
import { MatLegacyPaginatorIntl as MatPaginatorIntl } from '@angular/material/legacy-paginator';

@Injectable()
export class CustomPaginatorIntlComponent extends MatPaginatorIntl {
  itemsPerPageLabel = $localize`:@@resultsOnPage:Tuloksia sivulla`;
  nextPageLabel = $localize`:@@nextPage:Seuraava sivu`;
  previousPageLabel = $localize`:@@previousPage:Edellinen sivu`;

  getRangeLabel = function (page: number, pageSize: number, length: any) {
    if (length === 0 || pageSize === 0) {
      return '0 / ' + length;
    }

    length = Math.max(length, 0);

    const startIndex = page * pageSize;

    const endIndex =
      startIndex < length
        ? Math.min(startIndex + pageSize, length)
        : startIndex + pageSize;

    return startIndex + 1 + ' - ' + endIndex + ' / ' + length;
  };
}
