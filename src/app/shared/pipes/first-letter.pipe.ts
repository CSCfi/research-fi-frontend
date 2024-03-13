import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'firstLetter',
  standalone: true
})
export class FirstLetterPipe implements PipeTransform {
  transform(value: string): string {
    return value[0];
  }
}
