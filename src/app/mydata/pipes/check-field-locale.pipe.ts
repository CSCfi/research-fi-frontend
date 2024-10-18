import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'checkFieldLocale',
    standalone: true,
})
export class CheckFieldLocalePipe implements PipeTransform {
  transform(item: any, locale: string, fieldName: string) {
    if (item[fieldName + locale]) return item[fieldName + locale];

    switch (locale) {
      case 'Fi': {
        return item[fieldName + 'En']
          ? item[fieldName + 'En']
          : item[fieldName + 'Sv'];
      }
      case 'Sv': {
        return item[fieldName + 'En']
          ? item[fieldName + 'En']
          : item[fieldName + 'Fi'];
      }
      case 'En': {
        return item[fieldName + 'Fi']
          ? item[fieldName + 'Fi']
          : item[fieldName + 'Sv'];
      }
    }
  }
}
