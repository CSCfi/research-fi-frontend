import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'trimUrlStart'
})
export class TrimUrlStartPipe implements PipeTransform {

  transform(value: string): string {
    let index = 0;
    let urlEndIndex = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] === '/') {
        index += 1;
        if (index === 3) {
          urlEndIndex = i;
        }
      }
    }
    return value.substring(0, urlEndIndex +1) + '...';
  }
}