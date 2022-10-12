//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { FilterConfigType, TableColumn } from 'src/types';

export const Constants = {
  draftPatchPayload: 'mydata_draft_patch_payload',
  draftPublicationPatchPayload: 'mydata_draft_publication_patch_payload',
  draftDatasetPatchPayload: 'mydata_draft_dataset_patch_payload',
  draftFundingPatchPayload: 'mydata_draft_funding_patch_payload',
  draftCollaborationPatchPayload: 'mydata_draft_collaboration_patch_payload',
  draftProfile: 'mydata_draft',
};

export const FiltersConfig: FilterConfigType[] = [
  {
    label: 'Tila profiilissa',
    field: 'status',
    hasSubFields: false,
    limitHeight: true,
    open: true,
  },
  {
    label: 'Tietokokonaisuus',
    field: 'dataset',
    hasSubFields: false,
    limitHeight: true,
    open: true,
  },
  {
    label: 'Lähde',
    field: 'source',
    hasSubFields: false,
    limitHeight: true,
    open: true,
  },
  // {
  //   label: 'Kohde',
  //   field: 'target',
  //   hasSubFields: false,
  //   limitHeight: true,
  //   open: true,
  // },
];

export const TableColumns: TableColumn[] = [
  {
    label: 'selection',
    key: 'selection',
    mobile: true,
    sortDisabled: true,
    class: 'col-auto',
    labelHiddenMobile: true,
  },
  {
    label: 'Tieto',
    key: 'name',
    mobile: true,
    class: 'col-2',
    mobileSortLabel: 'Tieto (A-Ö)',
  },
  {
    label: 'Sisältö',
    key: 'content',
    mobile: true,
    class: 'col-3',
    mobileSortLabel: 'Sisältö (A-Ö)',
  },
  {
    label: 'Tiedejatutkimus.fi',
    key: 'public',
    mobile: true,
    class: 'col-3',
    mobileSortLabel: 'Tiedejatutkimus.fi:ssä julkaistut ensin',
    mobileSortDirection: 'desc',
    tooltip: 'Tooltip placeholder',
    showTooltipIcon: true,
  },
  {
    label: 'Lähde',
    key: 'source',
    mobile: true,
    class: 'col',
    mobileSortLabel: 'Lähde (Ä-Ö',
  },
  // {
  //   label: 'Jakaminen',
  //   key: 'sharing',
  //   mobile: true,
  //   class: 'col',
  //   cardClass: 'col-auto',
  //   tooltip: 'Tooltip placeholder',
  //   showTooltipIcon: true,
  //   sortDisabled: true,
  // },
];
