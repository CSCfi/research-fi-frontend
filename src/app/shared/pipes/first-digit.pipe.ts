import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'firstDigit',
  standalone: true
})
export class FirstDigitPipe implements PipeTransform {
  transform(value: number): number {
    const firstDigit = Math.abs(value).toString()[0];
    return parseInt(firstDigit);
  }
}
