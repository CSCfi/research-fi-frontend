//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { ElementRef } from '@angular/core';

// Tables
export type TableColumn = {
  key: string;
  mobile: boolean;
  label?: string;
  tooltip?: string;
  class?: string;
  sortDisabled?: boolean;
  overflowEnabled?: boolean;
  labelHidden?: boolean;
  labelHiddenMobile?: boolean;
  mobileSortLabel?: string;
  mobileSortDirection?: SortOrder;
  cardClass?: string;
  showTooltipIcon?: boolean;
};

export type TableRow = {
  label?: string | number;
  link?: string;
  template?: ElementRef<any>;
  title?: string;
  value?: any;
};

// Filters
export type FilterConfigType = {
  label: string;
  field: string;
  hasSubFields: boolean;
  limitHeight?: boolean;
  open?: boolean;
  hideSearch?: boolean;
  tooltip?: string;
  searchFromParent?: boolean;
  relatedPublications?: boolean;
  hideNoResults?: boolean;
};

// Active filters
export type ActiveFilter = {
  category: string;
  value: number | string;
  translation: string;
};

export type ActiveFiltersDialogConfig = {
  filtersConfig: FilterConfigType;
  fromYear?: number;
  toYear?: number;
};

// Sort options for sort-by-button component
type SortOrder = 'asc' | 'desc';

export type SortByOption = {
  key: string;
  label: string;
  direction?: SortOrder;
};

// Dialogs
export type DialogAction = {
  label: string;
  method: string;
  labelToggle?: {
    on: string;
    off: string;
  };
  primary?: boolean;
  flexStart?: boolean;
  action?: any;
};

// MyData
export type DataSource = {
  id: number;
  organization: {
    nameFi: string;
    nameEn: string;
    nameSv: string;
  };
  registeredDataSource: string;
};

export type ItemMeta = {
  id: number;
  type: number;
  show: boolean;
  primaryValue: boolean;
};

export type Item = {
  itemMeta: ItemMeta;
};

export type Field = {
  id: string;
  label: string;
  disabled: boolean;
  single: boolean;
  items: Partial<Item>[];
  hasPrimaryValue: boolean;
  joined: boolean;
  expanded?: boolean;
};

export type Group = {
  id: string;
  label: string;
  fields: Field[];
};

// E.g. in publications editor modal table
export type EditorModalColumn = {
  id: string;
  label: string;
  field: string;
  width?: string;
  ellipsis?: boolean;
  additionalFields?: AdditionalField[];
};

type AdditionalField = { field: string; ellipsis?: boolean; hidden?: boolean };
