import { Pipe, PipeTransform } from '@angular/core';
import { UtilityService } from 'src/app/shared/services/utility.service';

@Pipe({
  name: 'filterEmptyField',
})

// Helper pipe for checking if the field exists and has data
export class FilterEmptyFieldPipe implements PipeTransform {
  transform(field: any, data: any) {
    const checkEmpty = (item: { field: string }) => {
      return UtilityService.stringHasContent(data[item.field]);
    };

    return field.filter((item) => checkEmpty(item));
  }
}
