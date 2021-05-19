//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

type settingsType = {
  disabled: boolean;
  forceShow: boolean;
};

export function mapGroup(group, label, settings?: settingsType) {
  return group.map((obj) => ({
    ...obj,
    label: label,
    disabled: settings?.disabled,
  }))[0];
}

export function mapNameGroup(group, label, settings?: settingsType) {
  group[0].items.forEach(
    (el) =>
      (el.value =
        el.fullName.trim().length > 0
          ? el.fullName
          : el.firstNames + ' ' + el.lastName)
  );

  return group.map((obj) => ({
    ...obj,
    label: label,
    groupMeta: {
      ...obj.groupMeta,
      show: settings?.forceShow ? settings.forceShow : obj.groupMeta.show,
    },
    disabled: settings?.disabled,
  }))[0];
}
