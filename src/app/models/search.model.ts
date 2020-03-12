// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Publication, PublicationAdapter } from './publication.model';
import { Injectable } from '@angular/core';
import { Adapter } from './adapter.model';

export class Search {

    constructor(
        public total: number,
        public hits: Publication[]
    ) {}
}

@Injectable({
    providedIn: 'root'
})
export class SearchAdapter implements Adapter<Search> {
    constructor(private p: PublicationAdapter) {}
    adapt(item: any): Search {
        const publications: Publication[] = [];
        item.hits.hits.forEach(e => publications.push(this.p.adapt(e._source)));

        return new Search(
            item.hits.total.value,
            publications
        );
    }
}
