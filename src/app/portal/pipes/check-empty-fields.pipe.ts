// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'checkEmptyFields',
    standalone: true,
})

/*
 * E.g. in single-person component where we need to filter diffent sections for matching data
 */
export class CheckEmptyFieldsPipe implements PipeTransform {
  transform(fields: any[], values: any): any[] {
    if (Array.isArray(values)) {
      const matchingKeys = [
        ...new Set(
          values.flatMap((item) => {
            return Object.keys(item);
          })
        ),
      ];

      return fields.filter((field) => {
        return (
          matchingKeys.indexOf(field.key) > -1 &&
          values.find((value) => value[field.key])
        );
      });
    }

    return fields.filter((field) => values[field.key]?.length);
  }
}
