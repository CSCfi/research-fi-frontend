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
        public total: number,
        public feedUrl: string,
        public headline: string,
        public content: string,
        public url: string,
        public author: string,
        public timestamp: number,
        public organizationNameFi: string,
        public organizationId: string,
        public mediaUri: string,
    ) {}
}

@Injectable({
    providedIn: 'root'
})

export class NewsAdapter implements Adapter<News> {
    constructor() {}
    adapt(item: any): News {
        return new News(
            item.total,
            item.feedUrl,
            item.newsHeadline,
            item.newsContent?.replace(/<img.*?>/g, ''), // Remove img tags
            item.url,
            item.author,
            Date.parse(item.timestamp),
            item.organizationNameFi,
            item.organizationId,
            item.mediaUri,
        );
    }

    adaptMany(item: any): News[] {
        const news: News[] = [];
        const source = item.hits.hits;
        const totalValue = item.hits.total.value;
        // Add total count
        source.forEach(el => news.push(this.adapt({...el._source, total: totalValue})));
        return news;
    }
}
