import { Component } from '@angular/core';
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Paragraph,
  TabStopPosition,
  TabStopType,
  TextRun
} from 'docx';
import * as docx from 'docx';
import * as translations from '@mydata/components/cv-tool/cv-template-builder/CvTranslations';

export interface cvTopLevelParagraph {
  paragraphTitle: string;
  preFaceTexts?: string[];
  bulletsList?: string[];
}

export class CvTemplateBuilderComponent {

  allTranslations: any;

  private getTranslation(translationKey: string) {
    return this.allTranslations[translationKey];
  }

  public buildCvTemplate(lang: string): Document {
    this.allTranslations = translations.getTranslations(lang);

    let bulletsSec1 = [this.getTranslation('cv_1_bullet1'), this.getTranslation('cv_1_bullet2'), this.getTranslation('cv_1_bullet3'), this.getTranslation('cv_1_bullet4')];
    let paragraphContentSec1: cvTopLevelParagraph = {
      paragraphTitle: this.getTranslation('cv_1_personal_info_title'),
      bulletsList: bulletsSec1
    };

    let bulletsSec2 = [this.getTranslation('cv_2_bullet_1'),this.getTranslation('cv_2_bullet_2')];
    let paragraphContentSec2: cvTopLevelParagraph = {
      paragraphTitle: this.getTranslation('cv_2_degrees_heading'),
      bulletsList: bulletsSec2
    };

    let bulletsSec3 = [this.getTranslation('cv_3_other_edu_bullet1')];
    let paragraphContentSec3: cvTopLevelParagraph = {
      paragraphTitle: this.getTranslation('cv_3_other_edu_title'),
      bulletsList: bulletsSec3
    };

    let bulletsSec4 = [this.getTranslation('cv_4_language_skills_bullet1'), this.getTranslation('cv_4_language_skills_bullet2')];
    let paragraphContentSec4: cvTopLevelParagraph = {
      paragraphTitle: this.getTranslation('cv_4_language_skills_title'),
      bulletsList: bulletsSec4
    };

    let bulletsSec5 = [this.getTranslation('cv_5_employment_bullet1'), this.getTranslation('cv_5_employment_bullet2'), this.getTranslation('cv_5_employment_bullet3'), this.getTranslation('cv_5_employment_bullet4')];
    let paragraphContentSec5: cvTopLevelParagraph = {
      paragraphTitle: this.getTranslation('cv_5_employment_title'),
      bulletsList: bulletsSec5
    };

    let bulletsSec6 = [this.getTranslation('cv_6_previous_experience_bullet1'), this.getTranslation('cv_6_previous_experience_bullet2')];
    let paragraphContentSec6: cvTopLevelParagraph = {
      paragraphTitle:this.getTranslation('cv_6_previous_experience_title'),
      bulletsList: bulletsSec6
    };

    let prefaceTextsSec7 = [this.getTranslation('cv_7_career_breaks_title_after')];
    let bulletsSec7 = [this.getTranslation('cv_7_career_breaks_bullet1')];
    let paragraphContentSec7: cvTopLevelParagraph = {
      paragraphTitle: this.getTranslation('cv_7_career_breaks_title'),
      bulletsList: bulletsSec7,
      preFaceTexts: prefaceTextsSec7
    };

    let bulletsSec8 = [this.getTranslation('cv_8_fundings_and_grants_bullet1')];
    let paragraphContentSec8: cvTopLevelParagraph = {
      paragraphTitle: this.getTranslation('cv_8_fundings_and_grants_title'),
      bulletsList: bulletsSec8
    };

    let bulletsSec9 = [this.getTranslation('cv_9_research_bullet1'), this.getTranslation('cv_9_research_bullet2'), this.getTranslation('cv_9_research_bullet3'), this.getTranslation('cv_9_research_bullet4'), this.getTranslation('cv_9_research_bullet5')];
    let paragraphContentSec9: cvTopLevelParagraph = {
      paragraphTitle: this.getTranslation('cv_9_research_output_title`'),
      bulletsList: bulletsSec9
    };

    let bulletsSec10 = [this.getTranslation('cv_10_supervision_and_leadership_bullet1'), this.getTranslation('cv_10_supervision_and_leadership_bullet2')];
    let paragraphContentSec10: cvTopLevelParagraph = {
      paragraphTitle: this.getTranslation('cv_10_supervision_and_leadership_title'),
      bulletsList: bulletsSec10
    };

    let prefaceTextsSec11 = [this.getTranslation('cv_11_teaching_merits_title_after')];
    let bulletsSec11 = [this.getTranslation('cv_11_teaching_merits_bullet1'), this.getTranslation('cv_11_teaching_merits_bullet2'), this.getTranslation('cv_11_teaching_merits_bullet3'), this.getTranslation('cv_11_teaching_merits_bullet4')];
    let paragraphContentSec11: cvTopLevelParagraph = {
      paragraphTitle: this.getTranslation('cv_11_teaching_merits_title'),
      bulletsList: bulletsSec11,
      preFaceTexts: prefaceTextsSec11
    };

    let bulletsSec12 = [this.getTranslation('cv_12_awards_and_honours_bullet1'), this.getTranslation('cv_12_awards_and_honours_bullet2')];
    let paragraphContentSec12: cvTopLevelParagraph = {
      paragraphTitle: this.getTranslation('cv_12_awards_and_honours_title'),
      bulletsList: bulletsSec12
    };

    let bulletsSec13 = [this.getTranslation('cv_13_other_key_merits_bullet1'), this.getTranslation('cv_13_other_key_merits_bullet2'), this.getTranslation('cv_13_other_key_merits_bullet3'), this.getTranslation('cv_13_other_key_merits_bullet4'), this.getTranslation('cv_13_other_key_merits_bullet5'), this.getTranslation('cv_13_other_key_merits_bullet6'), this.getTranslation('cv_13_other_key_merits_bullet7'), this.getTranslation('cv_13_other_key_merits_bullet8'), this.getTranslation('cv_13_other_key_merits_bullet9'), this.getTranslation('cv_13_other_key_merits_bullet10')];
    let paragraphContentSec13: cvTopLevelParagraph = {
      paragraphTitle: this.getTranslation('cv_13_other_key_merits_title'),
      bulletsList: bulletsSec13
    };

    let bulletsSec14 = [this.getTranslation('cv_14_scientific_impact_bullet1'), this.getTranslation('cv_14_scientific_impact_bullet2'), this.getTranslation('cv_14_scientific_impact_bullet3'), this.getTranslation('cv_14_scientific_impact_bullet4'), this.getTranslation('cv_14_scientific_impact_bullet5')];
    let paragraphContentSec14: cvTopLevelParagraph = {
      paragraphTitle: this.getTranslation('cv_14_scientific_impact_title1'),
      bulletsList: bulletsSec14
    };

    let bulletsSec15 = [this.getTranslation('cv_15_other_merits_bullet1'), this.getTranslation('cv_15_other_merits_bullet2'), this.getTranslation('cv_15_other_merits_bullet3')];
    let paragraphContentSec15: cvTopLevelParagraph = {
      paragraphTitle: this.getTranslation('cv_15_other_merits_title'),
      bulletsList: bulletsSec15
    };

    console.log('getTranslation', this.getTranslation('cv_1_bullet1'));

    const filledTemplate = new docx.Document({
      styles: {
        default: {
          heading1: {
            run: {
              font: "Calibri",
              size: 52,
              bold: true,
              color: "FFFFFF",
            },
            paragraph: {
              alignment: AlignmentType.CENTER,
              spacing: { line: 276, before: 20 * 72 * 0.1, after: 20 * 72 * 0.05 },
            },
          },
          heading2: {
            run: {
              font: "Calibri",
              size: 26,
              bold: true,
            },
            paragraph: {
              spacing: { line: 276, before: 30 * 72 * 0.1, after: 20 * 72 * 0.05 },
            },
          },
        },
        paragraphStyles: [
          {
            id: "baseParagraphBlue",
            name: "Blue base paragraph",
            basedOn: "Normal",
            next: "Normal",
            run: {
              font: "Calibri",
              color: "66A4FB",
            },
            paragraph: {
              spacing: { line: 276 },
            },
          },
        ],
      },
      sections: [
        {
          properties: {},
          children: [
            new docx.Paragraph({
              text: this.getTranslation('cv_title:Ansioluettelo'),
              heading: HeadingLevel.TITLE,
              style: "heading1",
            }),
            new docx.Paragraph({
              text: this.getTranslation('cv_preface1'),
              style: "baseParagraphBlue",
            }),
            this.createBulletBlue(this.getTranslation('cv_bullet1')),
            this.createBulletBlue(this.getTranslation('cv_bullet2')),

            ...this.createMainLevelParagraph(paragraphContentSec1),
            ...this.createMainLevelParagraph(paragraphContentSec2),
            ...this.createMainLevelParagraph(paragraphContentSec3),
            ...this.createMainLevelParagraph(paragraphContentSec4),
            ...this.createMainLevelParagraph(paragraphContentSec5),
            ...this.createMainLevelParagraph(paragraphContentSec6),
            ...this.createMainLevelParagraph(paragraphContentSec7),
            ...this.createMainLevelParagraph(paragraphContentSec8),
            ...this.createMainLevelParagraph(paragraphContentSec9),
            ...this.createMainLevelParagraph(paragraphContentSec10),
            ...this.createMainLevelParagraph(paragraphContentSec11),
            ...this.createMainLevelParagraph(paragraphContentSec12),
            ...this.createMainLevelParagraph(paragraphContentSec13),
            ...this.createMainLevelParagraph(paragraphContentSec14),
            ...this.createMainLevelParagraph(paragraphContentSec15)
          ]
        }
      ]
    });
    return filledTemplate;
  }

  private createMainLevelParagraph(elements: cvTopLevelParagraph) {
    let ret: docx.Paragraph[] = [];

    ret.push(new docx.Paragraph({
      text: elements.paragraphTitle,
      heading: HeadingLevel.HEADING_2,
      style: "heading2",
    }));

    if (elements.bulletsList) {
      console.log('elements.bulletsList', elements);
      elements.bulletsList.forEach(bullet => {
        ret.push(this.createBulletBlue(bullet));
      });
    }

    return ret;
  }

  public createBulletBlue(text: string): Paragraph {
    return new Paragraph({
      text: text,
      style: "baseParagraphBlue",
      bullet: {
        level: 0
      }
    });
  }
}
