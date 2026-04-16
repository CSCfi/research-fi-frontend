import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';

import {
  PrimaryActionButtonComponent
} from '@shared/components/buttons/primary-action-button/primary-action-button.component';
import { ActivatedRoute } from '@angular/router';

import * as docx from 'docx';
import { saveAs } from 'file-saver';
import {
  CvTemplateBuilderComponent
} from '@mydata/components/cv-tool/cv-template-builder/cv-template-builder.component';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import {
  MydataSideNavigationComponent
} from '@mydata/components/mydata-side-navigation/mydata-side-navigation.component';
import { BannerDividerComponent } from '@shared/components/banner-divider/banner-divider.component';
import { clone, cloneDeep } from 'lodash-es';
import { ProfileService } from '@mydata/services/profile.service';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';
import * as translations from '@mydata/components/cv-tool/cv-template-builder/CvTranslations';
import { StickyFooterComponent } from '@mydata/components/sticky-footer/sticky-footer.component';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';
import { DialogComponent } from '@shared/components/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogAction } from '../../../../types';

export interface cvEducation {
  dateOfDegree?: string;
  degreeTitle?: string;
  nameOfInstitution?: string;
  locality?: string;
  country?: string;
  granterContactDetails?: string;
}

export interface CvContent {
  surname?: string;
  firstNames?: string;
  orcidId?: string;
  dateOfCv?: string;
  education?: cvEducation[];
}

@Component({
  selector: 'app-cv-tool',
  imports: [
    PrimaryActionButtonComponent,
    MatRadioButton,
    MatRadioGroup,
    MydataSideNavigationComponent,
    BannerDividerComponent,
    SvgSpritesComponent,
    StickyFooterComponent,
    TooltipDirective,
    DialogComponent
],
  templateUrl: './cv-tool.component.html',
  styleUrl: './cv-tool.component.scss'
})

export class CvToolComponent implements OnInit {


  cvToolTitle = $localize`:@@cv_tool_heading:CV-työkalu`;
  cv_intro_1_start = $localize`:@@cv_intro_1_start:from-localizations-file`;
  cv_intro_1_link_text = $localize`:@@cv_intro_1_link_text:from-localizations-file`;
  cv_intro_1_link = $localize`:@@cv_intro_1_link:from-localizations-file`;

  cv_intro_1_link_after = $localize`:@@cv_intro_1_link_after:from-localizations-file`;
  cv_intro_1_link_after_2 = $localize`:@@cv_intro_1_link_after_2:from-localizations-file`;

  importSelectionCv = 0;
  importSelectionPublicationsList = 0;
  import_radio_buttons_title = $localize`:@@import_radio_buttons_title:Valitse tuotavat tiedot`;
  import_radio_button1 = $localize`:@@import_radio_button1:Kaikki julkaistut ja julkaisemattomat profiilin tiedot`;
  import_radio_button2 = $localize`:@@import_radio_button2:Vain julkaistut profiilin tiedot`;
  importTargets = [this.import_radio_button1, this.import_radio_button2];
  importInitialSelections = [true, false];

  langSelectionCv = 0;
  langSelectionPublicationsList = 0;
  langAbbreviations = ['en', 'fi', 'sv'];
  language_radio_buttons_title = $localize`:@@language_radio_buttons_title:Valitse kieli`;
  lang_en = $localize`:@@language_radio_button1:Englanti`;
  lang_fi = $localize`:@@language_radio_button2:Suomi`;
  lang_sv = $localize`:@@language_radio_button3:Ruotsi`;
  langTargets = [this.lang_en, this.lang_fi, this.lang_sv];
  langInitialSelections = [true, false, false];

  download_cv_button_title = $localize`:@@download_cv_button_title:Lataa CV`;

  citationStyleSelection = 0;
  publication_list = $localize`:@@publication_list:Julkaisuluettelo`;
  publication_list_radio_buttons_title = $localize`:@@publication_list_radio_buttons_title:Valise julkaisuluettelon viittaustapa`;
  publicationListTargets = ['APA', 'Chicago', 'MLA'];
  publicationListInitialSelections = [true, false, false];

  publication_list_order_buttons_title = $localize`:@@publication_list_order_buttons_title:Valise julkaisuluettelon järjestys`;
  publication_list_order_targets = [$localize`:@@publication_list_radio_buttons_sort_year:Vuoden mukaan`, $localize`:@@publication_list_radio_buttons_sort_publication_type:OKM:n julkaisuluokituksen mukaan`];
  publication_list_radio_buttons_sort_publication_type_info = $localize`:@@publication_list_radio_buttons_sort_publication_type_info:OKM:n julkaisutiedonkeruun mukainen julkaisutyyppi A-G, I`;

  download_publication_list_button_title = $localize`:@@download_publication_list_button_title:Lataa julkaisuluettelo`;

  publication_list_note_title = $localize`:@@publication_list_note_title:Huomio`;
  publication_list_note_text = $localize`:@@publication_list_note_text:from-localizations-file`;

  orderByPublicationType = false;

  profileData: any;
  orcidId: string;
  fullName: string;

  cvFileName = 'CV';
  publicationListFileName = 'publications_list';


  templateBuilder = new CvTemplateBuilderComponent();

  citationStyles = ['APA', 'Chicago', 'MLA'];

  // Dialog variables
  showDialog: boolean;
  dialogTitle: any;
  dialogTemplate: any;
  dialogExtraContentTemplate: any;
  currentDialogActions: DialogAction | DialogAction[];
  disableDialogClose: boolean;

  constructor(public profileService: ProfileService, private route: ActivatedRoute, public dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.fetchProfileData().then(profileData => {
    });
  }

  changeImportSelectionCv(input) {
    this.importSelectionCv = input;
  }

  changeImportSelectionPublicationsList(input) {
    this.importSelectionPublicationsList = input;
  }

  changeLangSelectionCv(input) {
    this.langSelectionCv = input;
  }

  changeLangSelectionPublicationsList(input) {
    this.langSelectionPublicationsList = input;
  }



  changeCitationStyleSelection(input) {
    this.citationStyleSelection = input;
  }

  generateCvDialogActions: DialogAction[] = [
    { label: $localize`:@@cancel:Peruuta`, primary: false, method: 'close' },
    {
      label: this.download_cv_button_title,
      primary: true,
      method: 'generateCv',
      svgSymbolName: 'download',
      svgCssClass: 'download-icon primary-button-icon',
      iconAfter: true,
    },
  ];

  generatePublicationsListDialogActions  = [
    { label: $localize`:@@cancel:Peruuta`, primary: false, method: 'close' },
    {
      label: this.download_publication_list_button_title,
      primary: true,
      method: 'generatePublicationsList',
      svgSymbolName: 'download',
      svgCssClass: 'download-icon primary-button-icon',
      iconAfter: true,
    },
  ];

  generateCv(cvContent?:
             CvContent) {
    docx.Packer.toBlob(this.templateBuilder.buildCvTemplate(this.langAbbreviations[this.langSelectionCv], this.profileData, this.orcidId, (this.importSelectionCv === 1), false, this.citationStyleSelection, this.orderByPublicationType)).then((blob) => {
      this.cvFileName = this.fullName + '_-_' + translations.getTranslation(this.langAbbreviations[this.langSelectionCv], 'cv_title').replaceAll(' ', '_') + '.docx';
      saveAs(blob, this.cvFileName);
    });
  }

  generatePublicationsList(cvContent?: CvContent) {
    docx.Packer.toBlob(this.templateBuilder.buildCvTemplate(this.langAbbreviations[this.langSelectionPublicationsList], this.profileData, this.orcidId, (this.importSelectionPublicationsList === 1), true, this.citationStyleSelection, this.orderByPublicationType)).then((blob) => {
      this.publicationListFileName = this.fullName + '_-_' + translations.getTranslation(this.langAbbreviations[this.langSelectionPublicationsList], 'publication_list_title').replaceAll(' ', '_') + '_(' + this.citationStyles[this.citationStyleSelection] + ')' + '.docx';
      saveAs(blob, this.publicationListFileName);
    });
  }

  async fetchProfileData() {
    this.profileService
      .fetchProfileDataFromBackend()
      .then(
        (value) => {
          if (value) {
            this.profileService.setCurrentProfileData(
              cloneDeep(value.profileData)
            );
            this.profileData = clone(value.profileData);
            this.fullName = this.profileData[0].fields[0].items.filter(item => item.itemMeta.show === true)[0].fullName;
            this.fullName = this.fullName.replaceAll(' ', '_');
            this.orcidId = this.route.snapshot.data.orcidProfile.orcid;
          }
        });
  }

  openDialog(props: { template: TemplateRef<any>; disableDialogClose: boolean; title: string; actions: DialogAction | DialogAction[] }){
    this.langSelectionCv = 0;
    this.langSelectionPublicationsList = 0;
    this.importSelectionCv = 0;
    this.importSelectionPublicationsList = 0
    this.citationStyleSelection = 0;
    this.orderByPublicationType = false;
    this.dialogTitle = props.title;
    this.showDialog = true;
    this.dialogTemplate = props.template;
    //this.dialogExtraContentTemplate = props.extraContentTemplate;
    this.currentDialogActions = props.actions;
    this.disableDialogClose = props.disableDialogClose;
  }

  doDialogAction(action: string) {
    this.dialog.closeAll();
    this.dialogTitle = '';
    this.showDialog = false;
    this.dialogTemplate = null;

    switch (action) {
      case 'generateCv': {
        this.generateCv();
        break;
      }
      case 'generatePublicationsList': {
        this.generatePublicationsList();
        break;
      }
    }
  }

  closeDialog() {
    this.dialog.closeAll();
    this.dialogTitle = '';
    this.showDialog = false;
    this.dialogTemplate = null;
    this.disableDialogClose = false;
  }

}
