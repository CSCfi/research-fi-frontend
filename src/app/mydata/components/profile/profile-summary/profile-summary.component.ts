//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';

import { cloneDeep } from 'lodash-es';
import { take } from 'rxjs/operators';
import { PatchService } from '@mydata/services/patch.service';
import { PublicationsService } from '@mydata/services/publications.service';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { SnackbarService } from '@mydata/services/snackbar.service';
import { DraftService } from '@mydata/services/draft.service';
import { Constants } from '@mydata/constants/';
import { FieldTypes } from '@mydata/constants/fieldTypes';
import { GroupTypes, PortalGroups } from '@mydata/constants/groupTypes';
import { CommonStrings } from '@mydata/constants/strings';
import { DatasetsService } from '@mydata/services/datasets.service';
import { FundingsService } from '@mydata/services/fundings.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile-summary',
  templateUrl: './profile-summary.component.html',
  styleUrls: ['./profile-summary.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProfileSummaryComponent implements OnInit, OnDestroy {
  @Input() profileData: any;
  displayData: any;

  fieldTypes = FieldTypes;
  groupTypes = GroupTypes;

  filteredProfileData: any;

  openPanels = [];

  locale: string;

  showDialog: boolean;
  dialogData: any;
  currentIndex: number;

  editString = CommonStrings.edit;
  selectString = CommonStrings.select;

  removeGroupItemsSub: Subscription;

  noPublicDataText = $localize`:@@youHaveNotSelectedAnyPublicData:Et ole vielä valinnut julkisesti näytettäviä tietoja`;

  constructor(
    private appSettingsService: AppSettingsService,
    private patchService: PatchService,
    private publicationsService: PublicationsService,
    private datasetsService: DatasetsService,
    private fundingsService: FundingsService,
    private snackbarService: SnackbarService,
    private draftService: DraftService
  ) {
    this.locale = this.appSettingsService.capitalizedLocale;
  }

  ngOnInit(): void {
    // // DEV
    // const publications = this.profileData.find(
    //   (item) => item.id === 'publication'
    // );
    // if (publications.fields.length === 1) {
    //   publications.fields.unshift({
    //     id: 'imported',
    //     label: 'Tuodut julkaisut',
    //     items: [
    //       {
    //         id: '0392912223',
    //         title:
    //           'Damage Detection and Localization Using Autocorrelation Functions with Spatiotemporal Correlation',
    //         publicationYear: 2023,
    //         publicationTypeCode: 'A4',
    //         authors: 'Kullaa, Jyrki',
    //         organizationId: 10065,
    //         format: 'Artikkeli',
    //         audience: 'Tieteellinen',
    //         parentPublicationType: 'Konferenssialusta',
    //         peerReviewed: 'Vertaisarvioitu',
    //         journalName: 'Lecture Notes in Civil Engineering',
    //         conferenceName:
    //           'International Conference on Experimental Vibration Analysis for Civil Engineering Structures',
    //         issn: ' ',
    //         issn2: ' ',
    //         parentPublicationName:
    //           'Experimental Vibration Analysis for Civil Engineering Structures. Select Proceedings of the EVACES 2021',
    //         parentPublicationPublisher:
    //           'Wu,  Zhishen;  Nagayama,  Tomonori;  Dang,  Ji;  Astroza,  Rodrigo',
    //         artPublicationTypeCategories: [],
    //         artPublicationFieldsOfArt: [],
    //         artPublicationTypeCategoriesString: '',
    //         artPublicationFieldsOfArtString: '',
    //         artPublicationEvent: null,
    //         artPublicationVenue: null,
    //         isbn: '978-3-030-93235-0',
    //         isbn2: '978-3-030-93236-7',
    //         publisherName: 'Springer International Publishing',
    //         jufoCode: '5952',
    //         doi: '10.1007/978-3-030-93236-7_9',
    //         doiHandle: null,
    //         selfArchivedAddress: ' ',
    //         keywords: [
    //           {
    //             keyword: 'engineering',
    //             scheme: 'Avainsana',
    //             language: 'EN',
    //           },
    //         ],
    //         archiveCodeText: 'Ei',
    //         publisherOpenAccessText: '',
    //         archiveCodeVersionText: '',
    //         archiveEbargoDate: '',
    //         publicationStatusText: 'Kyllä',
    //         apcFee: '',
    //         apcPaymentYear: '',
    //         openAccess: false,
    //         abstract: ' ',
    //         openAccessText: 'Ei',
    //         articleTypeText: '',
    //         internationalPublication: 1,
    //         internationalCollaboration: false,
    //         businessCollaboration: false,
    //         languages: [
    //           {
    //             languageCode: 'EN',
    //             languageFi: 'englanti',
    //             languageEn: 'English',
    //             languageSv: 'engelska',
    //           },
    //         ],
    //         countries: [
    //           {
    //             countryFi: 'undefined',
    //             countryEn: 'undefined',
    //             countrySv: 'undefined',
    //           },
    //         ],
    //         fieldsOfScience: [
    //           {
    //             id: 112,
    //             name: 'Tilastotiede',
    //           },
    //           {
    //             id: 212,
    //             name: 'Rakennus- ja yhdyskuntatekniikka',
    //           },
    //           {
    //             id: 214,
    //             name: 'Kone- ja valmistustekniikka',
    //           },
    //         ],
    //         fieldsOfScienceString:
    //           'Tilastotiede; Rakennus- ja yhdyskuntatekniikka; Kone- ja valmistustekniikka',
    //         author: [
    //           {
    //             sectorId: '2',
    //             nameFiSector: 'Ammattikorkeakoulu',
    //             nameEnSector: 'University of Applied Sciences',
    //             nameSvSector: 'Yrkeshögskola',
    //             organization: [
    //               {
    //                 organizationId: '10065',
    //                 OrganizationNameFi: 'Metropolia ammattikorkeakoulu',
    //                 OrganizationNameEn:
    //                   'Metropolia University of Applied Sciences',
    //                 OrganizationNameSv: 'Metropolia ammattikorkeakoulu',
    //                 organizationUnit: [
    //                   {
    //                     OrgUnitId: '-1',
    //                     organizationUnitNameFi: 'Metropolia ammattikorkeakoulu',
    //                     organizationUnitNameEn:
    //                       'Metropolia University of Applied Sciences',
    //                     organizationUnitNameSv: 'Metropolia ammattikorkeakoulu',
    //                     person: [
    //                       {
    //                         Orcid: '0000-0003-0351-9644',
    //                         authorFirstNames: 'Jyrki',
    //                         authorLastName: 'Kullaa',
    //                       },
    //                     ],
    //                   },
    //                   {
    //                     OrgUnitId: '450',
    //                     organizationUnitNameFi: 'Ajoneuvo- ja konetekniikka',
    //                     organizationUnitNameEn: ' ',
    //                     organizationUnitNameSv: ' ',
    //                     person: [
    //                       {
    //                         Orcid: '0000-0003-0351-9644',
    //                         authorFirstNames: 'Jyrki',
    //                         authorLastName: 'Kullaa',
    //                       },
    //                     ],
    //                   },
    //                 ],
    //               },
    //             ],
    //           },
    //         ],
    //         selfArchivedData: [],
    //         completions: [
    //           'kullaa',
    //           'jyrki',
    //           'damage',
    //           'detection',
    //           'and',
    //           'localization',
    //           'using',
    //           'autocorrelation',
    //           'functions',
    //           'with',
    //           'spatiotemporal',
    //           'correlation',
    //         ],
    //         publicationChannel: 'Lecture Notes in Civil Engineering',
    //         citations: [],
    //         show: true,
    //         itemMeta: {
    //           id: '0392912223',
    //           type: 500,
    //           show: true,
    //           primaryValue: true,
    //         },
    //         publicationName:
    //           'Damage Detection and Localization Using Autocorrelation Functions with Spatiotemporal Correlation',
    //         dataSources: [
    //           {
    //             id: null,
    //             organization: {
    //               nameFi: 'Tiedejatutkimus.fi',
    //               nameSv: 'Tiedejatutkimus.fi',
    //               nameEn: 'Tiedejatutkimus.fi',
    //             },
    //             registeredDataSource: 'TTV',
    //           },
    //         ],
    //       },
    //       {
    //         id: '0393397423',
    //         title:
    //           'Modulation of chlorpyrifos toxicity to soil arthropods by simultaneous exposure to polyester microfibers or tire particle microplastics',
    //         publicationYear: 2023,
    //         publicationTypeCode: 'A1',
    //         authors:
    //           'Selonen, Salla; Jemec Kokalj, Anita; Benguedouar, Hiba; Alavian Petroody, Somayye Sadat; Dolar, Andraž; Drobne, Damjana; van Gestel, Cornelis A.M.',
    //         organizationId: 7020017,
    //         format: 'Artikkeli',
    //         audience: 'Tieteellinen',
    //         parentPublicationType: 'Lehti',
    //         peerReviewed: 'Vertaisarvioitu',
    //         journalName: 'Applied Soil Ecology',
    //         issn: '0929-1393',
    //         issn2: ' ',
    //         volume: '181',
    //         pageNumbers: '104657',
    //         articleNumber: '104657',
    //         artPublicationTypeCategories: [],
    //         artPublicationFieldsOfArt: [],
    //         artPublicationTypeCategoriesString: '',
    //         artPublicationFieldsOfArtString: '',
    //         artPublicationEvent: null,
    //         artPublicationVenue: null,
    //         isbn: ' ',
    //         isbn2: ' ',
    //         publisherName: 'Elsevier BV',
    //         jufoCode: '51532',
    //         doi: '10.1016/j.apsoil.2022.104657',
    //         doiHandle: 'https://doi.org/10.1016/j.apsoil.2022.104657',
    //         selfArchivedAddress: ' ',
    //         keywords: [
    //           {
    //             keyword: 'kuidut',
    //             scheme: 'Avainsana',
    //             language: 'EN',
    //           },
    //           {
    //             keyword: 'hyppyhäntäiset',
    //             scheme: 'Avainsana',
    //             language: 'EN',
    //           },
    //           {
    //             keyword: 'torjunta-aineet',
    //             scheme: 'Avainsana',
    //             language: 'EN',
    //           },
    //           {
    //             keyword: 'toksisuus',
    //             scheme: 'Avainsana',
    //             language: 'EN',
    //           },
    //           {
    //             keyword: 'maaperä',
    //             scheme: 'Avainsana',
    //             language: 'EN',
    //           },
    //           {
    //             keyword: 'ekotoksikologia',
    //             scheme: 'Avainsana',
    //             language: 'EN',
    //           },
    //           {
    //             keyword: 'niveljalkaiset',
    //             scheme: 'Avainsana',
    //             language: 'EN',
    //           },
    //           {
    //             keyword: 'mikromuovit',
    //             scheme: 'Avainsana',
    //             language: 'EN',
    //           },
    //           {
    //             keyword: 'mixtures',
    //             scheme: 'Avainsana',
    //             language: 'EN',
    //           },
    //           {
    //             keyword: 'Microplastics',
    //             scheme: 'Avainsana',
    //             language: 'EN',
    //           },
    //           {
    //             keyword: 'mikroroskat',
    //             scheme: 'Avainsana',
    //             language: 'EN',
    //           },
    //           {
    //             keyword: 'insektisidit',
    //             scheme: 'Avainsana',
    //             language: 'EN',
    //           },
    //           {
    //             keyword: 'plant protection products',
    //             scheme: 'Avainsana',
    //             language: 'EN',
    //           },
    //           {
    //             keyword: 'muovit',
    //             scheme: 'Avainsana',
    //             language: 'EN',
    //           },
    //           {
    //             keyword: 'woodlice',
    //             scheme: 'Avainsana',
    //             language: 'EN',
    //           },
    //           {
    //             keyword: 'kumi',
    //             scheme: 'Avainsana',
    //             language: 'EN',
    //           },
    //           {
    //             keyword: 'klorpyrifossi',
    //             scheme: 'Avainsana',
    //             language: 'EN',
    //           },
    //           {
    //             keyword: 'maasiirat',
    //             scheme: 'Avainsana',
    //             language: 'EN',
    //           },
    //           {
    //             keyword: 'IMPASSE-hanke',
    //             scheme: 'Avainsana',
    //             language: 'EN',
    //           },
    //           {
    //             keyword: 'soil ecotoxicology',
    //             scheme: 'Avainsana',
    //             language: 'EN',
    //           },
    //           {
    //             keyword: 'springtail',
    //             scheme: 'Avainsana',
    //             language: 'EN',
    //           },
    //         ],
    //         archiveCodeText: 'Ei',
    //         publisherOpenAccessText: 'Osittain avoin julkaisukanava',
    //         archiveCodeVersionText: '',
    //         archiveEbargoDate: '',
    //         publicationStatusText: 'Kyllä',
    //         apcFee: '',
    //         apcPaymentYear: '',
    //         openAccess: true,
    //         abstract: ' ',
    //         openAccessText: 'Kyllä',
    //         articleTypeText: 'Alkuperäisartikkeli',
    //         internationalPublication: 0,
    //         internationalCollaboration: true,
    //         businessCollaboration: false,
    //         languages: [
    //           {
    //             languageCode: 'EN',
    //             languageFi: 'englanti',
    //             languageEn: 'English',
    //             languageSv: 'engelska',
    //           },
    //         ],
    //         countries: [
    //           {
    //             countryFi: 'undefined',
    //             countryEn: 'undefined',
    //             countrySv: 'undefined',
    //           },
    //         ],
    //         fieldsOfScience: [
    //           {
    //             id: 1181,
    //             name: 'Ekologia, evoluutiobiologia',
    //           },
    //         ],
    //         fieldsOfScienceString: 'Ekologia, evoluutiobiologia',
    //         author: [
    //           {
    //             sectorId: '3',
    //             nameFiSector: 'Tutkimuslaitos',
    //             nameEnSector: 'Research institute',
    //             nameSvSector: 'Forskningsinstitut',
    //             organization: [
    //               {
    //                 organizationId: '7020017',
    //                 OrganizationNameFi: 'Suomen ympäristökeskus',
    //                 OrganizationNameEn: 'Finnish Environment Institute',
    //                 OrganizationNameSv: 'Finlands miljöcentral',
    //                 organizationUnit: [
    //                   {
    //                     OrgUnitId: '-1',
    //                     organizationUnitNameFi: 'Suomen ympäristökeskus',
    //                     organizationUnitNameEn: 'Finnish Environment Institute',
    //                     organizationUnitNameSv: 'Finlands miljöcentral',
    //                     person: [
    //                       {
    //                         Orcid: '0000-0002-2070-0288',
    //                         authorFirstNames: 'Salla',
    //                         authorLastName: 'Selonen',
    //                       },
    //                     ],
    //                   },
    //                   {
    //                     OrgUnitId: '7020160001',
    //                     organizationUnitNameFi: 'Laboratoriokeskus',
    //                     organizationUnitNameEn: 'Laboratory centre',
    //                     organizationUnitNameSv: 'Laboratoriecentret',
    //                     person: [
    //                       {
    //                         Orcid: '0000-0002-2070-0288',
    //                         authorFirstNames: 'Salla',
    //                         authorLastName: 'Selonen',
    //                       },
    //                     ],
    //                   },
    //                 ],
    //               },
    //             ],
    //           },
    //         ],
    //         selfArchivedData: [],
    //         completions: [
    //           'selonen',
    //           'salla',
    //           'jemec',
    //           'kokalj',
    //           'anita',
    //           'benguedouar',
    //           'hiba',
    //           'alavian',
    //           'petroody',
    //           'somayye',
    //           'sadat',
    //           'dolar',
    //           'andraž',
    //           'drobne',
    //           'damjana',
    //           'van',
    //           'gestel',
    //           'cornelis',
    //           'modulation',
    //           'chlorpyrifos',
    //           'toxicity',
    //           'soil',
    //           'arthropods',
    //           'simultaneous',
    //           'exposure',
    //           'polyester',
    //           'microfibers',
    //           'tire',
    //           'particle',
    //           'microplastics',
    //         ],
    //         publicationChannel: 'Applied Soil Ecology',
    //         citations: [],
    //         show: true,
    //         itemMeta: {
    //           id: '0393397423',
    //           type: 500,
    //           show: true,
    //           primaryValue: true,
    //         },
    //         publicationName:
    //           'Modulation of chlorpyrifos toxicity to soil arthropods by simultaneous exposure to polyester microfibers or tire particle microplastics',
    //         dataSources: [
    //           {
    //             id: null,
    //             organization: {
    //               nameFi: 'Tiedejatutkimus.fi',
    //               nameSv: 'Tiedejatutkimus.fi',
    //               nameEn: 'Tiedejatutkimus.fi',
    //             },
    //             registeredDataSource: 'TTV',
    //           },
    //         ],
    //       },
    //       {
    //         id: '0393748423',
    //         title:
    //           'Remote work and the COVID-19 pandemic: An artificial intelligence-based topic modeling and a future agenda',
    //         publicationYear: 2023,
    //         publicationTypeCode: 'A1',
    //         authors:
    //           'Aleem Majid, Sufyan Muhammad, Ameer Irfan, Mustak Mekhail  ',
    //         organizationId: 10089,
    //         format: 'Artikkeli',
    //         audience: 'Tieteellinen',
    //         parentPublicationType: 'Lehti',
    //         peerReviewed: 'Vertaisarvioitu',
    //         journalName: 'Journal of Business Research',
    //         issn: '0148-2963',
    //         issn2: '1873-7978',
    //         volume: '154',
    //         articleNumber: '113303',
    //         artPublicationTypeCategories: [],
    //         artPublicationFieldsOfArt: [],
    //         artPublicationTypeCategoriesString: '',
    //         artPublicationFieldsOfArtString: '',
    //         artPublicationEvent: null,
    //         artPublicationVenue: null,
    //         isbn: ' ',
    //         isbn2: ' ',
    //         publisherName: 'Elsevier',
    //         jufoCode: '59794',
    //         doi: '10.1016/j.jbusres.2022.113303',
    //         doiHandle: 'https://doi.org/10.1016/j.jbusres.2022.113303',
    //         archiveCodeText: 'Ei',
    //         publisherOpenAccessText: 'Osittain avoin julkaisukanava',
    //         archiveCodeVersionText: '',
    //         archiveCodeLincenseText: '',
    //         archiveEbargoDate: '',
    //         publicationStatusText: 'Kyllä',
    //         apcFee: '',
    //         apcPaymentYear: '',
    //         openAccess: false,
    //         abstract: ' ',
    //         openAccessText: 'Ei',
    //         articleTypeText: 'Alkuperäisartikkeli',
    //         internationalPublication: 1,
    //         countryCode: '840',
    //         internationalCollaboration: true,
    //         businessCollaboration: false,
    //         languages: [
    //           {
    //             languageCode: 'EN',
    //             languageFi: 'englanti',
    //             languageEn: 'English',
    //             languageSv: 'engelska',
    //           },
    //         ],
    //         countries: [
    //           {
    //             publicationCountryCode: '840',
    //             countryFi: 'Yhdysvallat (USA)',
    //             countryEn: 'United States, USA',
    //             countrySv: 'Förenta Staterna (USA)',
    //           },
    //         ],
    //         fieldsOfScience: [
    //           {
    //             id: 512,
    //             name: 'Liiketaloustiede',
    //           },
    //         ],
    //         fieldsOfScienceString: 'Liiketaloustiede',
    //         author: [
    //           {
    //             sectorId: '1',
    //             nameFiSector: 'Yliopisto',
    //             nameEnSector: 'University',
    //             nameSvSector: 'Universitet',
    //             organization: [
    //               {
    //                 organizationId: '10089',
    //                 OrganizationNameFi: 'Turun yliopisto',
    //                 OrganizationNameEn: 'University of Turku',
    //                 OrganizationNameSv: 'Åbo universitet',
    //                 organizationUnit: [
    //                   {
    //                     OrgUnitId: '-1',
    //                     organizationUnitNameFi: 'Turun yliopisto',
    //                     organizationUnitNameEn: 'University of Turku',
    //                     organizationUnitNameSv: 'Åbo universitet',
    //                     person: [
    //                       {
    //                         authorFirstNames: 'Majid',
    //                         authorLastName: 'Aleem',
    //                       },
    //                       {
    //                         authorFirstNames: 'Muhammad',
    //                         authorLastName: 'Sufyan',
    //                       },
    //                     ],
    //                   },
    //                   {
    //                     OrgUnitId: '2608202',
    //                     organizationUnitNameFi: 'Kv. liiketoiminta',
    //                     organizationUnitNameEn: ' ',
    //                     organizationUnitNameSv: ' ',
    //                     person: [
    //                       {
    //                         authorFirstNames: 'Majid',
    //                         authorLastName: 'Aleem',
    //                       },
    //                       {
    //                         authorFirstNames: 'Muhammad',
    //                         authorLastName: 'Sufyan',
    //                       },
    //                     ],
    //                   },
    //                 ],
    //               },
    //             ],
    //           },
    //         ],
    //         completions: [
    //           'aleem',
    //           'majid',
    //           'sufyan',
    //           'muhammad',
    //           'ameer',
    //           'irfan',
    //           'mustak',
    //           'mekhail',
    //           'remote',
    //           'work',
    //           'and',
    //           'the',
    //           'covid-19',
    //           'pandemic',
    //           'artificial',
    //           'intelligence-based',
    //           'topic',
    //           'modeling',
    //           'and',
    //           'future',
    //           'agenda',
    //         ],
    //         publicationChannel: 'Journal of Business Research',
    //         citations: [],
    //         show: true,
    //         itemMeta: {
    //           id: '0393748423',
    //           type: 500,
    //           show: true,
    //           primaryValue: true,
    //         },
    //         publicationName:
    //           'Remote work and the COVID-19 pandemic: An artificial intelligence-based topic modeling and a future agenda',
    //         dataSources: [
    //           {
    //             id: null,
    //             organization: {
    //               nameFi: 'Tiedejatutkimus.fi',
    //               nameSv: 'Tiedejatutkimus.fi',
    //               nameEn: 'Tiedejatutkimus.fi',
    //             },
    //             registeredDataSource: 'TTV',
    //           },
    //         ],
    //       },
    //     ],
    //   });
    // }
    this.displayData = cloneDeep(this.profileData);
    // this.mergeImportedPublications(this.displayData);
  }

  openDialog(event: MouseEvent, index: number) {
    event.stopPropagation();
    this.showDialog = true;

    const selectedGroup = cloneDeep(this.profileData[index]);

    const filteredFields = selectedGroup.fields.filter(
      (field) => field.items.length
    );

    // Filter out fields with 0 items from groups that don't use search from portal functionality
    if (PortalGroups.indexOf(selectedGroup.id) === -1) {
      selectedGroup.fields = filteredFields;
    }

    this.dialogData = {
      data: selectedGroup,
      trigger: event.detail,
    };
    this.currentIndex = index;
  }

  closeDialog() {
    this.showDialog = false;
  }

  handleChanges(result) {
    this.closeDialog();

    const confirmedPayLoad = this.patchService.confirmedPayLoad;

    this.draftService.saveDraft(this.displayData);

    // Groups are used in different loops to set storage items and handle removal of items
    const patchGroups = [
      { key: Constants.draftProfile, data: this.displayData },
      {
        key: Constants.draftPatchPayload,
        data: this.patchService.confirmedPayLoad,
      },
      {
        id: GroupTypes.publication,
        key: Constants.draftPublicationPatchPayload,
        service: this.publicationsService,
        data: this.publicationsService.confirmedPayload,
        deletables: this.publicationsService.deletables,
      },
      {
        id: GroupTypes.dataset,
        key: Constants.draftDatasetPatchPayload,
        service: this.datasetsService,
        data: this.datasetsService.confirmedPayload,
        deletables: this.datasetsService.deletables,
      },
      {
        id: GroupTypes.funding,
        key: Constants.draftFundingPatchPayload,
        service: this.fundingsService,
        data: this.fundingsService.confirmedPayload,
        deletables: this.fundingsService.deletables,
      },
    ];

    const portalPatchGroups = patchGroups.filter((group) => group.id);

    if (result) {
      // Adding imported data to profileData enables correct listing of imported items if
      // editor modal is opened again before imported items have been published
      this.profileData[this.currentIndex].fields = result.fields;
      // Update binded profile data. Renders changes into summary view
      this.displayData[this.currentIndex] = result;

      this.mergeImportedPublications();

      // Handle removal of items added from portal search
      portalPatchGroups.forEach((group) => {
        if (result.id === group.id) {
          if (group.deletables.length) {
            const removeItem = (publication: { id: string }) => {
              group.service.removeFromConfirmed(publication.id);
            };

            for (const [i, item] of group.deletables.entries()) {
              removeItem(item);
              if (i === group.deletables.length - 1)
                group.service.clearDeletables();
            }

            this.removeGroupItemsSub = group.service
              .removeItems(group.deletables)
              .pipe(take(1))
              .subscribe(() => {});
          }
        }
      });

      // Set draft data into storage with SSR check
      if (this.appSettingsService.isBrowser && confirmedPayLoad.length) {
        patchGroups.forEach((group) => {
          sessionStorage.setItem(group.key, JSON.stringify(group.data));
        });

        // Display snackbar only if user has made changes
        if (result && confirmedPayLoad.length) {
          this.snackbarService.show(
            $localize`:@@draftUpdated:Luonnos päivitetty`,
            'success'
          );
        }
      }
    }
  }

  // Merge imported publications for display purposes.
  mergeImportedPublications() {
    const publications = this.displayData.find(
      (item) => item.id === 'publication'
    );

    if (publications?.fields?.length > 1) {
      const imported = publications.fields.find(
        (item) => item.id === 'imported'
      );
      const existing = publications.fields.find(
        (item) => item.id === 'publication'
      );

      const merged = existing.items.concat(imported.items);

      publications.fields = [{ ...existing, items: merged }];
    }
  }

  ngOnDestroy(): void {
    this.removeGroupItemsSub?.unsubscribe();
  }
}
