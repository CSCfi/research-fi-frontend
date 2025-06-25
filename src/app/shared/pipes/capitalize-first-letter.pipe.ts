import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalizeFirstLetter',
  standalone: true
})
export class CapitalizeFirstLetterPipe implements PipeTransform {

  transform(value: string): unknown {
    // Check if the string is null, undefined, or empty
    if (!value || value.length === 0) {
      return '';
    }
    return value[0].toUpperCase() + value.slice(1);
  }
}
