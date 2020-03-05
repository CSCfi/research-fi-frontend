import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cutContent'
})
export class CutContentPipe implements PipeTransform {

  transform(value: string, maxLength: number): unknown {
    let result = '';
    if (value.length > maxLength) {
      result = value.slice(maxLength) + '...';
    } else {
      result = value;
    }
    return result;
  }

}
