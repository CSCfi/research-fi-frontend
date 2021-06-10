//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

type settingsType = {
  disabled: boolean;
  expanded: boolean;
  setDefault: boolean;
  single: boolean;
};

export function mapGroup(group, label, settings?: settingsType) {
  return {
    label: label,
    groupItems: group.filter((item) => item.items.length > 0),
    disabled: settings?.disabled,
    single: settings?.single,
  };
}

export function mapNameGroup(group, label, settings?: settingsType) {
  group.map((item) =>
    item.items.forEach(
      (el) =>
        (el.value =
          el.fullName.trim().length > 0
            ? el.fullName
            : el.firstNames + ' ' + el.lastName)
    )
  );

  // Set default value
  // if (settings?.setDefault) {
  //   group[0].groupMeta.show = true;
  //   group[0].items[0].itemMeta.show = true;
  // }

  return {
    label: label,
    groupItems: group.filter((item) => item.items.length > 0),
    disabled: settings?.disabled,
    single: settings?.single,
    expanded: settings?.expanded,
  };
}
