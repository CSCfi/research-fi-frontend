import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'convertToArray',
})
export class ConvertToArrayPipe implements PipeTransform {
  transform(value: any) {
    return Array.isArray(value) ? value : [value];
  }
}
