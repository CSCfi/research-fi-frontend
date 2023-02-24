// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from './adapter.model';

export class Shortcut {
  constructor(
    public placement: number,
    public titleFi: string,
    public titleSv: string,
    public titleEn: string,
    public captionFi: string,
    public captionSv: string,
    public captionEn: string,
    public image: string,
    public imageAltFi: string,
    public imageAltSv: string,
    public imageAltEn: string,
    public link: string,
    public isExternalLink: boolean
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class ShortcutAdapter implements Adapter<Shortcut> {
  constructor() {}
  adapt(item: any): Shortcut {
    return new Shortcut(
      item.placement_id,
      item.title_fi,
      item.title_sv,
      item.title_en,
      item.content_fi,
      item.content_sv,
      item.content_en,
      item.image,
      item.image_alt_fi,
      item.image_alt_sv,
      item.image_alt_en,
      item.link,
      item.isExternalLink
    );
  }

  adaptMany(item: any): Shortcut[] {
    const shortcuts: Shortcut[] = [];
    const source = item;
    source.forEach((el) => shortcuts.push(this.adapt(el)));
    return shortcuts;
  }
}
