import { Component } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import {
  PrimaryActionButtonComponent
} from '@shared/components/buttons/primary-action-button/primary-action-button.component';
import { Router, RouterLink } from '@angular/router';

import * as docx from 'docx';
import { saveAs } from 'file-saver';
import {
  CvTemplateBuilderComponent
} from '@mydata/components/cv-tool/cv-template-builder/cv-template-builder.component';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';

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
    NgForOf
  ],
  templateUrl: './cv-tool.component.html',
  styleUrl: './cv-tool.component.scss'
})

export class CvToolComponent {

  langSelection = 0;
  langAbbreviations = ['en', 'fi', 'sv'];

  import_radio_buttons_title = $localize`:@@import_radio_buttons_title:Valitse CV:n kieli`;
  lang_en = $localize`:@@language_radio_button1:Englanti`;
  lang_fi = $localize`:@@language_radio_button2:Suomi`;
  lang_sv = $localize`:@@language_radio_button3:Ruotsi`;

  targets = [this.lang_en, this.lang_fi, this.lang_sv];
  initialSelections = [true, false, false];


  templateBuilder = new CvTemplateBuilderComponent();

  changeSelection(input){
    this.langSelection = input;
    console.log('input', input);
  }

  generate(cvContent?: CvContent) {
    console.log('this.langAbbreviations[this.langSelection]', this.langAbbreviations[this.langSelection], this.langSelection);
    docx.Packer.toBlob(this.templateBuilder.buildCvTemplate(this.langAbbreviations[this.langSelection])).then((blob) => {
      console.log(blob);
      saveAs(blob, 'cv-template.docx');
    });
  }
}
