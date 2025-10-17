import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import {
  PrimaryActionButtonComponent
} from '@shared/components/buttons/primary-action-button/primary-action-button.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

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
import { CollaborationsService } from '@mydata/services/collaborations.service';
import { PatchService } from '@mydata/services/patch.service';
import { NotificationService } from '@shared/services/notification.service';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { DraftService } from '@mydata/services/draft.service';
import { SecondaryButtonComponent } from '@shared/components/buttons/secondary-button/secondary-button.component';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';

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
    NgIf,
    PrimaryActionButtonComponent,
    RouterLink,
    MatRadioButton,
    MatRadioGroup,
    NgForOf,
    MydataSideNavigationComponent,
    BannerDividerComponent,
    SecondaryButtonComponent,
    SvgSpritesComponent
  ],
  templateUrl: './cv-tool.component.html',
  styleUrl: './cv-tool.component.scss'
})

export class CvToolComponent implements OnInit {



  cvToolTitle = $localize`:@@cv_tool_heading:CV-työkalu`;
  cv_intro_1_start  = $localize`:@@cv_intro_1_start:from-localizations-file`;
  cv_intro_1_link_text = $localize`:@@cv_intro_1_link_text:from-localizations-file`;
  cv_intro_1_link = $localize`:@@cv_intro_1_link:from-localizations-file`;

  cv_intro_1_link_after = $localize`:@@cv_intro_1_link_after:from-localizations-file`;
  cv_intro_1_link_after_2 = $localize`:@@cv_intro_1_link_after_2:from-localizations-file`;

  importSelection = 0;
  import_radio_buttons_title = $localize`:@@import_radio_buttons_title:Valitse CV-pohjaan tuotavat tiedot`;
  import_radio_button1 = $localize`:@@import_radio_button1:Kaikki julkaistut ja julkaisemattomat profiilin tiedot`;
  import_radio_button2 =  $localize`:@@import_radio_button2:Vain julkaistut profiilin tiedot`;
  importTargets = [this.import_radio_button1, this.import_radio_button2];
  importInitialSelections = [true, false];

  langSelection = 0;
  langAbbreviations = ['en', 'fi', 'sv'];
  language_radio_buttons_title = $localize`:@@language_radio_buttons_title:Valitse CV:n kieli`;
  lang_en = $localize`:@@language_radio_button1:Englanti`;
  lang_fi = $localize`:@@language_radio_button2:Suomi`;
  lang_sv = $localize`:@@language_radio_button3:Ruotsi`;
  langTargets = [this.lang_en, this.lang_fi, this.lang_sv];
  langInitialSelections = [true, false, false];

  download_cv_button_title = $localize`:@@download_cv_button_title:Lataa CV`;

  citationStyleSelection = 0;
  publication_list_radio_buttons_title = $localize`:@@publication_list_radio_buttons_title:Valise julkaisuluettelon viittaustapa`;
  publicationListTargets = ['APA', 'Chicago', 'MLA']
  publicationListInitialSelections = [true, false, false];

  download_publication_list_button_title = $localize`:@@download_publication_list_button_title:Lataa julkaisuluettelo`;

  profileData: any;
  orcidId: string;
  fullName: string;

  cvFileName = 'CV';
  publicationListFileName = 'puiblications_list'


  templateBuilder = new CvTemplateBuilderComponent();

  constructor(public profileService: ProfileService,  private route: ActivatedRoute,) {
  }

  ngOnInit(): void {
    this.fetchProfileData().then(profileData => {
    });
    this.orcidId = this.route.snapshot.data.orcidProfile.orcid;
    console.log(this.route.snapshot.data.orcidProfile.name);
    this.cvFileName = this.route.snapshot.data.orcidProfile.name;
    this.cvFileName = this.cvFileName.replaceAll(' ', '_');
    this.publicationListFileName = this.cvFileName + "_-_Publication_list.docx"
      this.cvFileName = this.cvFileName + "_-_CV.docx"
  }

  changeImportSelection(input){
    this.importSelection = input;
  }

  changeLangSelection(input){
    this.langSelection = input;
  }

  changeCitationStyleSelection(input){
    this.citationStyleSelection = input;
  }

  generateCv(cvContent?:
             CvContent) {
    docx.Packer.toBlob(this.templateBuilder.buildCvTemplate(this.langAbbreviations[this.langSelection], this.profileData, this.orcidId, (this.importSelection === 1), false, this.citationStyleSelection)).then((blob) => {
      console.log(blob);
      saveAs(blob, this.cvFileName);
    });
  }

  generatePublicationsList(cvContent?: CvContent) {
    docx.Packer.toBlob(this.templateBuilder.buildCvTemplate(this.langAbbreviations[this.langSelection], this.profileData, this.orcidId, (this.importSelection === 1), true, this.citationStyleSelection)).then((blob) => {
      console.log(blob);
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
            console.log('profileData', this.profileData);
          }
        });
  }

}
