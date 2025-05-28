import { Pipe, PipeTransform } from '@angular/core';
import { Inject, LOCALE_ID } from '@angular/core';
import { UtilityService } from '@shared/services/utility.service';

@Pipe({
  name: 'checkLang',
  standalone: true,
})

/*
 * Get object value with Lodasg get() method. Used eg. when collecting values with dot notation.
 */
export class CheckLangPipe implements PipeTransform {
  constructor(@Inject(LOCALE_ID) protected localeId: string) {}

  transform(field: any, item: string): string {
    // tslint:disable-next-line: curly
    if (!item) return undefined;
    // Change locale to field name format
    const capitalizedLocale =
      this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
    // Get the content based on the current locale
    const content = item[field + capitalizedLocale]?.toString()?.trim() || '';
    // Check if the original locale has valuable content
    const contentIsValid = UtilityService.stringHasContent(content);

    // Dont perform checks if content is valid
    if (contentIsValid) {
      return content;
    }
    // Return content based on locale and priority if field doesn't exist in its original locale
    let res;
    switch (this.localeId) {
      case 'fi': {
        res = UtilityService.stringHasContent(item[field + 'En'])
          ? item[field + 'En']
          : item[field + 'Sv'];
        break;
      }
      case 'en': {
        res = UtilityService.stringHasContent(item[field + 'Fi'])
          ? item[field + 'Fi']
          : item[field + 'Sv'];
        break;
      }
      case 'sv': {
        res = UtilityService.stringHasContent(item[field + 'En'])
          ? item[field + 'En']
          : item[field + 'Fi'];
        break;
      }
    }
    // If still no content and Und exists, take that
    res =
      !UtilityService.stringHasContent(res) && item[field + 'Und']
        ? item[field + 'Und']
        : res;
    return res;
  }
}