//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';
import { AppSettingsService } from '@shared/services/app-settings.service';

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
  constructor(private appSettingsService: AppSettingsService) {}

  /*
   * Reusable utility functions to be used when mapping data in
   * model-adapter pattern.
   */

  mapGroup(group, id, label, settings?: SettingsType) {
    return {
      id: id,
      label: label,
      groupItems: this.mapGroupItems(group),
      disabled: settings?.disabled,
      single: settings?.single,
      hasPrimaryValue: settings?.primaryValue,
      joined: settings?.joined,
    };
  }

  mapGroupNew(group, id, label, settings?: SettingsType) {
    return {
      id: id,
      label: label,
      groupItems: this.mapGroupItemsNew(group),
      disabled: settings?.disabled,
      single: settings?.single,
      hasPrimaryValue: settings?.primaryValue,
      joined: settings?.joined,
    };
  }

  mapGroupItemsNew(group) {
    let ret = [];
    let nest = { items: [...group] };
    ret.push(nest);
    return ret;
  }

  mapNameGroup(group, id, label, settings?: SettingsType) {
    group.map((item) =>
      item.items.forEach(
        (el) =>
          (el.value =
            el.fullName.trim().length > 0
              ? el.fullName
              : el.firstNames + ' ' + el.lastName)
      )
    );

    let ret = {
      id: id,
      label: label,
      groupItems: this.mapGroupItems(group),
      disabled: settings?.disabled,
      single: settings?.single,
      expanded: settings?.expanded,
    };
    return ret;
  }

  mapNameGroupNew(group, id, label, settings?: SettingsType) {
    group.map((item) =>
          (item.value =
            item.fullName.trim().length > 0
              ? item.fullName
              : item.firstNames + ' ' + item.lastName)

    );
    let ret = {
      id: id,
      label: label,
      groupItems: this.mapGroupItemsNew(group),
      disabled: settings?.disabled,
      single: settings?.single,
      expanded: settings?.expanded,
    };
    return ret;
  }

  mapGroupItems(groupItems) {
    let gi = groupItems
      .filter((item) => item.items.length > 0)
      .map((groupItem) => ({
        ...groupItem,
        source: {
          ...groupItem.source,
          organization: {
            name: groupItem.source.organization[
            'name' + this.appSettingsService.capitalizedLocale
              ],
          },
        },
      }));
    return gi;
  }

  mapGroupItemsNewOld(groupItems) {
    let gi = groupItems
      .map((groupItem) => ({
        items: {
          ...groupItem
        },
      }));
    return gi;
  }

  mapGroupAffiliations(group, id, label, settings?: SettingsType) {
    return {
      id: id,
      label: label,
      groupItems: group,
      disabled: settings?.disabled,
      single: settings?.single,
      hasPrimaryValue: settings?.primaryValue,
      joined: settings?.joined,
    };
  }

  mapGroupGeneralNew(group, id, inputFieldNameOld, label, settings?: SettingsType) {
    let newGroupItems = [];
    newGroupItems.push({items: group[inputFieldNameOld]});
    if (newGroupItems[0].items === undefined) {
      newGroupItems[0] = [];
    }
    return {
      id: id,
      label: label,
      groupItems: newGroupItems,
      disabled: settings?.disabled,
      single: settings?.single,
      hasPrimaryValue: settings?.primaryValue,
      joined: settings?.joined,
    };
  }

  mapGroupFieldName(group, id, label, fieldName, settings?: SettingsType) {
    group.map((groupItem) => groupItem.items.forEach((item) => item.value));

    return {
      id: id,
      label: label,
      groupItems: this.mapGroupItems(group),
      localized: settings?.localized,
      fieldName: fieldName,
    };
  }

  mapGroupFieldNameNew(group, id, label, fieldName, settings?: SettingsType) {
    group.map((item) => item.value);
    return {
      id: id,
      label: label,
      groupItems: this.mapGroupItemsNew(group),
      localized: settings?.localized,
      fieldName: fieldName,
    };
  }
}
