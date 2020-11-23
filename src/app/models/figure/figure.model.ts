// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from '../adapter.model';
import { SingleFigure, SingleFigureAdapter } from './single-figure.model';

export class Figure {

  constructor(
    public id: string,
    public placement: number,
    public titleFi: string,
    public titleSv: string,
    public titleEn: string,
    public figures: SingleFigure[],
  ) {}
}

@Injectable({
    providedIn: 'root'
})

export class FigureAdapter implements Adapter<Figure> {
  constructor( private sf: SingleFigureAdapter) {}
  adapt(item: any): Figure {
    let figures: SingleFigure[] = [];
    item.items ? item.items.forEach(el => figures.push(this.sf.adapt({...el, parent: item.placement_id}))) : figures = [];

    return new Figure(
      's' + item.placement_id,
      item.placement_id,
      item.title_fi,
      item.title_sv,
      item.title_en,
      figures
    );
  }

  adaptMany(item: any): Figure[] {
    const figures: Figure[] = [];
    const source = item;
    source.forEach(el => figures.push(this.adapt(el)));
    return figures;
  }
}
