import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'replaceSpace',
    standalone: true,
})
export class ReplaceSpacePipe implements PipeTransform {
  transform(value: string): unknown {
    // tslint:disable-next-line: curly
    return value.replace(/ |,|\./g, '-');
  }
}
