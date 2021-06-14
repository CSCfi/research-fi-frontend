import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cutContent',
})
export class CutContentPipe implements PipeTransform {
  transform(value: string, maxLength: number): unknown {
    // tslint:disable-next-line: curly
    if (value === undefined) return '';
    let result = '';
    if (value.length > maxLength) {
      result = value.slice(0, maxLength) + '...';
    } else {
      result = value;
    }
    return result;
  }
}
