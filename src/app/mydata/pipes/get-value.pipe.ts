import { Pipe, PipeTransform } from '@angular/core';
import { get } from 'lodash-es';

@Pipe({
  name: 'getValue',
})

/*
 * Get object value from array by string path
 */
export class GetValuePipe implements PipeTransform {
  transform(array: any[], path: string): string {
    return get(array, path);
  }
}
