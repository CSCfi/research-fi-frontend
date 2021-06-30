import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'joinItems',
})
export class JoinItemsPipe implements PipeTransform {
  transform(items: any, key: string) {
    return key ? items.map((item) => item[key]).join(', ') : items.join(', ');
  }
}
