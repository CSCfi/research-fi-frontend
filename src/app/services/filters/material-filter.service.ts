import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MaterialFilterService {

  filterData = [];

  singleFilterData = [
  ];

  constructor() { }

  shapeData(data) {
    const source = data;
    source.shaped = true;
    return source;
  }

}
