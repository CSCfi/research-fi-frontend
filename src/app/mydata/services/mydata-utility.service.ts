//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';
import { Field } from 'src/types';

type SettingsType = {
  disabled?: boolean;
  expanded?: boolean;
  setDefault?: boolean;
  single?: boolean;
  localized?: boolean;
  primaryValue?: boolean;
  joined?: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class MydataUtilityService {
  constructor() {}

  /*
   * Reusable utility functions to be used when mapping data in
   * model-adapter pattern.
   */
  mapField(items, id, label, settings?: SettingsType): Field {
    return {
      id: id,
      label: label,
      items: items || [],
      disabled: settings?.disabled,
      single: settings?.single,
      hasPrimaryValue: settings?.primaryValue,
      joined: settings?.joined,
    };
  }

  mapNameField(group, id, label, settings?: SettingsType): Field {
    group.map(
      (item) =>
        (item.value =
          item.fullName.trim().length > 0
            ? item.fullName
            : item.firstNames + ' ' + item.lastName)
    );

    return this.mapField(group, id, label, settings);
  }

  mapGroupGeneral(
    group,
    id,
    inputFieldNameOld,
    label,
    settings?: SettingsType
  ) {
    return {
      id: id,
      label: label,
      items: group[inputFieldNameOld] || [],
      disabled: settings?.disabled,
      single: settings?.single,
      hasPrimaryValue: settings?.primaryValue,
      joined: settings?.joined,
    };
  }
}
