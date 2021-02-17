// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from './adapter.model';

export class Page {
  constructor(
    public id: number,
    public titleFi: string,
    public titleSv: string,
    public titleEn: string,
    public contentFi: string,
    public contentSv: string,
    public contentEn: string
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class PageAdapter implements Adapter<Page> {
  constructor() {}
  adapt(item: any): Page {
    return new Page(
      item.page_id,
      item.title_fi,
      item.title_sv,
      item.title_en,
      item.content_fi,
      item.content_sv,
      item.content_en
    );
  }

  adaptMany(item: any): Page[] {
    const pages: Page[] = [];
    const source = item;
    source.forEach((el) => pages.push(this.adapt(el)));
    return pages;
  }
}
