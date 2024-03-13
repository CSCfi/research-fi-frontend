import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'limit',
  standalone: true
})
export class LimitPipe implements PipeTransform {
  transform(value: any[], limit: number, enabled = true): any[] {
    // Async pipes return nulls
    if (value == null) {
      return [];
    }

    if (enabled) {
      return value.slice(0, limit);
    } else {
      return value;
    }
  }
}
