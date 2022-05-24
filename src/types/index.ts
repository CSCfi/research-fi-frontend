import { ElementRef } from '@angular/core';

export type TableColumn = {
  key: string;
  mobile: boolean;
  label?: string;
  tooltip?: string;
  class?: string;
  sortDisabled?: boolean;
  overflowEnabled?: boolean;
};

export type TableRowItem = {
  label?: string;
  link?: string;
  template?: ElementRef<any>;
  title?: string;
};
