// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from '../adapter.model';

export class SingleFigure {

  constructor(
    public id: string,
    public placement: number,
    public titleFi: string,
    public titleSv: string,
    public titleEn: string,
    public descriptionFi: string,
    public descriptionSv: string,
    public descriptionEn: string,
    public thumbnail: string,
    public iframeFi: string,
    public iframeSv: string,
    public iframeEn: string,
    public link: string,
    public sourceFi: string,
    public sourceSv: string,
    public sourceEn: string,
    public infoFi: string,
    public infoSv: string,
    public infoEn: string,
    public roadmap: boolean,
  ) {}
}

@Injectable({
    providedIn: 'root'
})

export class SingleFigureAdapter implements Adapter<SingleFigure> {
  constructor() {}
  adapt(item: any): SingleFigure {
    return new SingleFigure(
      item.placement_id,
      item.placement_id,
      item.title_fi,
      item.title_sv,
      item.title_en,
      item.description_fi,
      item.description_sv,
      item.description_en,
      item.thumbnail,
      item.iframe_fi,
      item.iframe_sv,
      item.iframe_en,
      item.link_id,
      item.source_fi,
      item.source_sv,
      item.source_en,
      item.info_fi,
      item.info_sv,
      item.info_en,
      item.roadmap,
    );
  }

}
