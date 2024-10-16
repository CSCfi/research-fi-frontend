//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { FilterConfigType, TableColumn } from 'src/types';
import { GroupTypes } from './groupTypes';

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
    label: $localize`:@@statusInProfile:Tila profiilissa`,
    field: 'status',
    hasSubFields: false,
    limitHeight: true,
    open: true,
  },
  {
    label: $localize`:@@dataSourcesDataset:Tietokokonaisuus`,
    field: 'dataset',
    hasSubFields: false,
    limitHeight: true,
    open: true,
  },
  {
    label: $localize`:@@source:Lähde`,
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

// Used in data sources table
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
    label: $localize`:@@information:Tieto`,
    key: 'name',
    mobile: true,
    class: 'col-2',
    mobileSortLabel: $localize`:@@dataSourcesInformationSort:Tieto (A-Ö)`,
  },
  {
    label: $localize`:@@content:Sisältö`,
    key: 'content',
    mobile: true,
    class: 'col-4',
    mobileSortLabel: $localize`:@@dataSourcesContentSort:Tieto (A-Ö)`,
  },
  {
    label: $localize`:@@appName:Tiedejatutkimus.fi`,
    key: 'public',
    mobile: true,
    class: 'col-3',
    mobileSortLabel: 'Tiedejatutkimus.fi:ssä julkaistut ensin',
    mobileSortDirection: 'desc',
    tooltip: $localize`:@@dataSourcesInformationTooltip:Tieto voi olla asetettu julkiseksi Tiedejatutkimus.fi:ssä julkaistuun profiiliin tai piilotettu julkisesta profiilista.`,
    showTooltipIcon: true,
  },
  {
    label: $localize`:@@source:Lähde`,
    key: 'source',
    mobile: true,
    class: 'col-2',
    mobileSortLabel: $localize`:@@dataSourcesSourceSort:Lähde (A-Ö)`,
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

// Table column configurations for groups that use search-from-portal functionality
export const PublicationColumns = [
  {
    id: 'year',
    label: $localize`:@@year:Vuosi`,
    field: 'publicationYear',
    width: '1',
  },
  {
    id: 'name',
    ellipsis: true,
    label: $localize`:@@name:Nimi`,
    field: 'title',
    width: '8',
    additionalFields: [
      { field: 'authors', ellipsis: true },
      { field: 'parentPublicationName', hidden: true },
      { field: 'doi', hidden: true },
    ],
  },
  {
    id: 'source',
    label: $localize`:@@source:Lähde`,
    field: 'source',
    width: '2',
  },
];

export const DatasetColumns = [
  {
    id: 'year',
    label: $localize`:@@year:Vuosi`,
    field: 'year',
    width: '1',
  },
  {
    id: 'name',
    ellipsis: true,
    label: $localize`:@@name:Nimi`,
    field: 'name',
    width: '8',
    additionalFields: [
      {
        field: 'authors',
        useComponent: true,
        hidden: true,
        label:
          $localize`:@@tkiAuthors:Tekijät` +
          ' / ' +
          $localize`:@@orgOrganization:Organisaatio`,
      },
      { field: 'urn', hidden: true, label: $localize`:@@identifier:Tunniste` },
      {
        field: 'description',
        ellipsis: true,
        cutContent: true,
        label: $localize`:@@description:Kuvaus`,
      },
    ],
  },
  {
    id: 'source',
    label: $localize`:@@source:Lähde`,
    field: 'source',
    width: '2',
  },
];

export const ActivityColumns = [
  {
    id: 'timing',
    label: $localize`:@@timing:Ajoitus`,
    field: 'timing',
    width: '2',
  },
  {
    id: 'roleNameType',
    ellipsis: true,
    label: $localize`:@@activity:Aktiviteetti`,
    field: 'roleNameType',
    width: '6',
    additionalFields: [
      {
        field: 'type',
        hidden: true,
        label: $localize`:@@activityType:Aktiviteetin tyyppi`,
      },
      {
        field: 'role',
        hidden: true,
        label: $localize`:@@actorRoleInActivity:Tekijä ja rooli aktiviteetissa`,
      },
      {
        field: 'organizationName',
        hidden: true,
        label: $localize`:@@organization:Organisaatio`,
      },
      {
        field: 'departmentName',
        hidden: true,
        label: $localize`:@@department:Yksikkö`,
      },
      {
        field: 'url',
        hidden: true,
        label: 'URL',
      },
    ],
  },
  {
    id: 'source',
    label: $localize`:@@source:Lähde`,
    field: 'source',
    width: '2',
  },
];

export const FundingColumns = [
  {
    id: 'year',
    label: $localize`:@@year:Vuosi`,
    field: 'startYear',
    width: '1',
  },
  {
    id: 'name',
    ellipsis: true,
    label: $localize`:@@name:Nimi`,
    field: 'name',
    width: '8',
    additionalFields: [
      // { field: 'funderProjectNumber' },
      // {
      //   field: 'description',
      //   ellipsis: true,
      //   cutContent: true,
      // },
      // {
      //   field: 'recipient.personNameAndOrg',
      //   hidden: true,
      // },
      // {
      //   field: 'funder.typeOfFundingName',
      //   hidden: true,
      // },
      {
        field: 'funder.name',
        hidden: true,
      },
    ],
  },
  {
    id: 'source',
    label: $localize`:@@source:Lähde`,
    field: 'source',
    width: '2',
  },
];

export const PortalGroupIds = [
  GroupTypes.publication,
  GroupTypes.dataset,
  GroupTypes.funding,
  GroupTypes.activitiesAndRewards,
];
