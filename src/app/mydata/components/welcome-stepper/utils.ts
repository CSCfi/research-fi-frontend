//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

/*
 * Common pipeable functions
 */
export function checkSelected(item) {
  return item.groupMeta.show;
}

export function checkEmpty(item: { values: string | any[] }) {
  return item.values?.length > 0;
}
