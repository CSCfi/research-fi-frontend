import { Pipe, PipeTransform } from '@angular/core';
import { get } from 'lodash-es';

@Pipe({
    name: 'getValue',
    standalone: true,
})

/*
 * Get object value with Lodasg get() method. Used eg. when collecting values with dot notation.
 */
export class GetValuePipe implements PipeTransform {
  transform(values: any, path: string): string {
    return get(values, path);
  }
}
