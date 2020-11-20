// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from './adapter.model';

export class Shortcuts {

  constructor(
    public placement: number,
    public titleFi: string,
    public titleSv: string,
    public titleEn: string,
    public contentFi: string,
    public contentSv: string,
    public contentEn: string,
    public image: string,
    public url: string,
  ) {}
}

@Injectable({
    providedIn: 'root'
})

export class ShortcutsAdapter implements Adapter<Shortcuts> {
  constructor() {}
  adapt(item: any): Shortcuts {
    return new Shortcuts(
      item.placement_id,
      item.title_fi,
      item.title_sv,
      item.title_en,
      item.content_fi,
      item.content_sv,
      item.content_en,
      item.image,
      item.link,
    );
  }

  adaptMany(item: any): Shortcuts[] {
    const shortcuts: Shortcuts[] = [];
    const source = item;
    source.forEach(el => shortcuts.push(this.adapt(el)));
    return shortcuts;
  }
}
