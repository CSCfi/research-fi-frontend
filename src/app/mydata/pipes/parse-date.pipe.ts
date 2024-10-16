import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'parseDate',
    standalone: true,
})
export class ParseDatePipe implements PipeTransform {
  transform(object: any): unknown {
    const date = `${object.day}.${object.month}.${object.year}`;

    // TODO: Better check for date
    if (Object.values(object).includes(0)) {
      return object.year > 0 ? object.year : '';
    } else {
      return date;
    }
  }
}
