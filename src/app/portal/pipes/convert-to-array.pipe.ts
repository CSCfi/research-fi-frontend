import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'convertToArray',
    standalone: true,
})
export class ConvertToArrayPipe implements PipeTransform {
  transform(value: any) {
    return Array.isArray(value) ? value : [value];
  }
}
