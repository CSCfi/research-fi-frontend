// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from './adapter.model';

export class News {

    constructor(
        public feedUrl: string,
        public headline: string,
        public content: string,
        public url: string,
        public author: string,
        public timestamp: number,
        public organizationNameFi: string,
        public organizationId: string,
        public mediaUrl: string,
    ) {}
}

@Injectable({
    providedIn: 'root'
})

export class NewsAdapter implements Adapter<News> {
    constructor() {}
    adapt(item: any): News {

        return new News(
            item.feedUrl,
            item.newsHeadline,
            item.newsContent,
            item.url,
            item.author,
            Date.parse(item.timestamp),
            item.organizationNameFi,
            item.organizationId,
            item.mediaUrl,
        );
    }

    adaptMany(item: any): News[] {
        const news: News[] = [];
        const source = item.hits.hits;

        source.forEach(el => news.push(this.adapt(el._source)));
        return news;
    }
}
