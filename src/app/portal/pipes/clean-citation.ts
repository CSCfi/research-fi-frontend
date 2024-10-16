//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'cleanCitation',
    standalone: true,
})
export class CleanCitationPipe implements PipeTransform {
  constructor() {}
  transform(citation: string) {
    return citation?.slice(0, citation.indexOf('Crossref. Web.'));
  }
}
