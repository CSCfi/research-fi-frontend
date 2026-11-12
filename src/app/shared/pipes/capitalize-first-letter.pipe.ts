import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalizeFirstLetter',
  standalone: true
})
export class CapitalizeFirstLetterPipe implements PipeTransform {

  transform(value: any): unknown {
    // Process only strings, return other values as they are
    if (typeof value !== 'string') {
      return value;
    }

    if (value.length === 0) {
      return '';
    }
    return value[0].toUpperCase() + value.slice(1);
  }
}
