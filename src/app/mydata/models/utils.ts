//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

type settingsType = {
  disabled: boolean;
  forceShow: boolean;
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
  if (settings?.forceShow) {
    const defaultItem = group.find((item) => item.dataSource.name === 'ORCID');
    defaultItem.groupMeta.show = true;
    defaultItem.items[0].itemMeta.show = true;
  }

  return {
    label: label,
    groupItems: group.filter((item) => item.items.length > 0),
    disabled: settings?.disabled,
    single: settings?.single,
  };
}
