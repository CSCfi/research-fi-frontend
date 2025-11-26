import {
  AlignmentType,
  Document, ExternalHyperlink,
  HeadingLevel,
  Paragraph,
  TextRun
} from 'docx';
import * as docx from 'docx';
import * as translations from '@mydata/components/cv-tool/cv-template-builder/CvTranslations';
import * as cvDataformatter from '@mydata/components/cv-tool/cv-template-builder/CvDataFormatter';
import { PublicationCitationAdapter } from '@portal/models/publication/publication-citation.model';
import { GroupTypes } from '@mydata/constants/groupTypes';


export interface cvTopLevelParagraph {
  paragraphTitle: string;
  preFaceTexts?: string[];
  bulletsList?: string[];
  bulletsAfter?: string;
  activityContent?: string[];
}

export interface cvDataFormatted {
  firstNames: string;
  lastName: string;
  orcid: string;
  date: string;
  degrees: any[];
  otherEducationAndExpertise: any[];
  currentEmployment: any[];
  previousWorkExperience: any[];
  researchFundingAndGrants: any[];
  researchSupervisionAndLeadershipExperience: any[];
  teachingMerits: any[];
  awardsAndHonors: any[];
  researchDatasets: any[];
  publications: any[];
  activities: any[];
}

export const citationStyle = {
  'APA': 0,
  'Chicago': 1,
  'MLA': 2
};

const groupTypes = GroupTypes;

export class CvTemplateBuilderComponent {
  langCode = 'fi';

  constructor() {
  }


  private isCitationValid(publication: any) {
    return (publication?.authorsText?.length > 0 && !!publication?.publicationYear && publication?.publicationName?.length > 0 && publication?.publicationChannel.length > 0);
  }

  private adaptCitation(publicationItem, citationStyle: number) {
    let citationAdapter = new PublicationCitationAdapter();
    let citationsObject = citationAdapter.adapt(publicationItem);
    switch (citationStyle) {
      case 0: {
        return citationsObject.apa;
      }
      case 1: {
        return citationsObject.chicago;
      }
      case 2: {
        return citationsObject.mla;
      }
      default: {
        return undefined;
      }
    }
  }

  private getTranslation(translationKey: string) {
    return translations.getTranslation(this.langCode, translationKey);
  }

  public buildCvTemplate(lang: string, profileData: any, orcidId: string, filterVisible: boolean, isPublicationList: boolean, citationStyle: number): Document {
    let cvData: cvDataFormatted = cvDataformatter.formatCvData(lang, profileData, orcidId, filterVisible);
    this.langCode = lang;

    let bulletsSec1 = [this.getTranslation('cv_1_bullet1'), this.getTranslation('cv_1_bullet2'), this.getTranslation('cv_1_bullet3'), this.getTranslation('cv_1_bullet4')];
    let paragraphContentSec1: cvTopLevelParagraph = {
      paragraphTitle: this.getTranslation('cv_1_personal_info_title'),
      bulletsList: bulletsSec1,
      bulletsAfter: this.getTranslation('cv_1_bullets_after')
    };

    let bulletsSec2 = [this.getTranslation('cv_2_bullet_1'), this.getTranslation('cv_2_bullet_2')];
    let paragraphContentSec2: cvTopLevelParagraph = {
      paragraphTitle: this.getTranslation('cv_2_degrees_heading'),
      bulletsList: bulletsSec2,
      bulletsAfter: this.getTranslation('cv_1_bullets_after')
    };

    let bulletsSec3 = [this.getTranslation('cv_3_other_edu_bullet1')];
    let paragraphContentSec3: cvTopLevelParagraph = {
      paragraphTitle: this.getTranslation('cv_3_other_edu_title'),
      bulletsList: bulletsSec3,
      bulletsAfter: this.getTranslation('cv_1_bullets_after')
    };

    let bulletsSec4 = [this.getTranslation('cv_4_language_skills_bullet1'), this.getTranslation('cv_4_language_skills_bullet2')];
    let paragraphContentSec4: cvTopLevelParagraph = {
      paragraphTitle: this.getTranslation('cv_4_language_skills_title'),
      bulletsList: bulletsSec4,
      bulletsAfter: this.getTranslation('cv_1_bullets_after')
    };

    let bulletsSec5 = [this.getTranslation('cv_5_employment_bullet1'), this.getTranslation('cv_5_employment_bullet2'), this.getTranslation('cv_5_employment_bullet3'), this.getTranslation('cv_5_employment_bullet4')];
    let paragraphContentSec5: cvTopLevelParagraph = {
      paragraphTitle: this.getTranslation('cv_5_employment_title'),
      bulletsList: bulletsSec5,
      bulletsAfter: this.getTranslation('cv_1_bullets_after')
    };

    let bulletsSec6 = [this.getTranslation('cv_6_previous_experience_bullet1'), this.getTranslation('cv_6_previous_experience_bullet2')];
    let paragraphContentSec6: cvTopLevelParagraph = {
      paragraphTitle: this.getTranslation('cv_6_previous_experience_title'),
      bulletsList: bulletsSec6,
      bulletsAfter: this.getTranslation('cv_1_bullets_after')
    };

    let prefaceTextsSec7 = [this.getTranslation('cv_7_career_breaks_title_after')];
    let bulletsSec7 = [this.getTranslation('cv_7_career_breaks_bullet1')];
    let paragraphContentSec7: cvTopLevelParagraph = {
      paragraphTitle: this.getTranslation('cv_7_career_breaks_title'),
      bulletsList: bulletsSec7,
      preFaceTexts: prefaceTextsSec7,
      bulletsAfter: this.getTranslation('cv_1_bullets_after')
    };

    let bulletsSec8 = [this.getTranslation('cv_8_fundings_and_grants_bullet1')];
    let paragraphContentSec8: cvTopLevelParagraph = {
      paragraphTitle: this.getTranslation('cv_8_fundings_and_grants_title'),
      bulletsList: bulletsSec8,
      bulletsAfter: this.getTranslation('cv_1_bullets_after')
    };

    let bulletsSec9 = [this.getTranslation('cv_9_research_bullet1'), this.getTranslation('cv_9_research_bullet2'), this.getTranslation('cv_9_research_bullet3'), this.getTranslation('cv_9_research_bullet4'), this.getTranslation('cv_9_research_bullet5')];
    let paragraphContentSec9: cvTopLevelParagraph = {
      paragraphTitle: this.getTranslation('cv_9_research_output_title'),
      bulletsList: bulletsSec9,
      bulletsAfter: this.getTranslation('cv_1_bullets_after')
    };

    let bulletsSec10 = [this.getTranslation('cv_10_supervision_and_leadership_bullet1'), this.getTranslation('cv_10_supervision_and_leadership_bullet2')];
    let paragraphContentSec10: cvTopLevelParagraph = {
      paragraphTitle: this.getTranslation('cv_10_supervision_and_leadership_title'),
      bulletsList: bulletsSec10,
      bulletsAfter: this.getTranslation('cv_1_bullets_after')
    };

    let prefaceTextsSec11 = [this.getTranslation('cv_11_teaching_merits_title_after')];
    let bulletsSec11 = [this.getTranslation('cv_11_teaching_merits_bullet1'), this.getTranslation('cv_11_teaching_merits_bullet2'), this.getTranslation('cv_11_teaching_merits_bullet3'), this.getTranslation('cv_11_teaching_merits_bullet4')];
    let paragraphContentSec11: cvTopLevelParagraph = {
      paragraphTitle: this.getTranslation('cv_11_teaching_merits_title'),
      bulletsList: bulletsSec11,
      preFaceTexts: prefaceTextsSec11,
      bulletsAfter: this.getTranslation('cv_1_bullets_after')
    };

    let bulletsSec12 = [this.getTranslation('cv_12_awards_and_honours_bullet1'), this.getTranslation('cv_12_awards_and_honours_bullet2')];
    let paragraphContentSec12: cvTopLevelParagraph = {
      paragraphTitle: this.getTranslation('cv_12_awards_and_honours_title'),
      bulletsList: bulletsSec12,
      bulletsAfter: this.getTranslation('cv_1_bullets_after')
    };

    let bulletsSec13 = [this.getTranslation('cv_13_other_key_merits_bullet1'), this.getTranslation('cv_13_other_key_merits_bullet2'), this.getTranslation('cv_13_other_key_merits_bullet3'), this.getTranslation('cv_13_other_key_merits_bullet4'), this.getTranslation('cv_13_other_key_merits_bullet5'), this.getTranslation('cv_13_other_key_merits_bullet6'), this.getTranslation('cv_13_other_key_merits_bullet7'), this.getTranslation('cv_13_other_key_merits_bullet8'), this.getTranslation('cv_13_other_key_merits_bullet9'), this.getTranslation('cv_13_other_key_merits_bullet10')];
    let paragraphContentSec13: cvTopLevelParagraph = {
      paragraphTitle: this.getTranslation('cv_13_other_key_merits_title'),
      bulletsList: bulletsSec13,
      bulletsAfter: this.getTranslation('cv_1_bullets_after')
    };

    let bulletsSec14 = [this.getTranslation('cv_14_scientific_impact_bullet1'), this.getTranslation('cv_14_scientific_impact_bullet2'), this.getTranslation('cv_14_scientific_impact_bullet3'), this.getTranslation('cv_14_scientific_impact_bullet4'), this.getTranslation('cv_14_scientific_impact_bullet5')];
    let paragraphContentSec14: cvTopLevelParagraph = {
      paragraphTitle: this.getTranslation('cv_14_scientific_impact_title1'),
      bulletsList: bulletsSec14,
      bulletsAfter: this.getTranslation('cv_1_bullets_after')
    };

    let bulletsSec15 = [this.getTranslation('cv_15_other_merits_bullet1'), this.getTranslation('cv_15_other_merits_bullet2'), this.getTranslation('cv_15_other_merits_bullet3')];
    let paragraphContentSec15: cvTopLevelParagraph = {
      paragraphTitle: this.getTranslation('cv_15_other_merits_title'),
      bulletsList: bulletsSec15,
      bulletsAfter: this.getTranslation('cv_1_bullets_after')
    };

    //let firstName = profileData[0].items[0].fields[0]

    if (!isPublicationList) {
      // CV TEMPLATE
      const cvTemplate = new docx.Document({
        styles: {
          default: {
            heading1: {
              run: {
                font: 'Calibri',
                size: 52,
                bold: true
              },
              paragraph: {
                alignment: AlignmentType.CENTER,
                spacing: { line: 276, before: 20 * 72 * 0.1, after: 20 * 72 * 0.05 }
              }
            },
            heading2: {
              run: {
                font: 'Calibri',
                size: 26,
                bold: true
              },
              paragraph: {
                spacing: { line: 276, before: 30 * 72 * 0.1, after: 20 * 72 * 0.05 }
              }
            }
          },
          paragraphStyles: [
            {
              id: 'baseParagraphBlue',
              name: 'Blue base paragraph',
              basedOn: 'Normal',
              next: 'Normal',
              run: {
                font: 'Calibri',
                color: '66A4FB'
              },
              paragraph: {
                spacing: { line: 276 }
              }
            },
            {
              id: 'baseParagraphBlack',
              name: 'Black base paragraph',
              basedOn: 'Normal',
              next: 'Normal',
              run: {
                font: 'Calibri',
                color: '000000'
              },
              paragraph: {
                spacing: { line: 276 }
              }
            }
          ]

        },
        sections: [
          {
            properties: {},
            children: [
              this.createHeading(this.getTranslation('cv_title')),
              this.createBaseParagraph(''),
              this.createHyperlinkMidText(this.getTranslation('cv_preface1'), this.getTranslation('cv_preface1_link_text'), this.getTranslation('cv_preface1_link'), this.getTranslation('cv_preface1_after_link')),
              this.createBaseParagraph(''),
              this.createHyperlinkMidTextBulleted(this.getTranslation('cv_bullet1'), this.getTranslation('cv_bullet1_link'), this.getTranslation('cv_bullet1_link'), ''),
              this.createBulletBlue(this.getTranslation('cv_bullet2')),
              ...this.createMainLevelParagraph(paragraphContentSec1),
              this.createBaseParagraph(''),
              this.createBaseParagraph(cvData.lastName),
              this.createBaseParagraph(cvData.firstNames),
              this.createHyperlink(cvData.orcid, cvData.orcid),
              this.createBaseParagraph(cvData.date),
              ...this.createMainLevelParagraph(paragraphContentSec2),
              this.createBaseParagraph(''),
              ...this.createDegreesRows(cvData.degrees),
              ...this.createMainLevelParagraph(paragraphContentSec3),
              ...this.createMainLevelParagraph(paragraphContentSec4),
              ...this.createMainLevelParagraph(paragraphContentSec5),
              this.createBaseParagraph(''),
              ...this.createEmploymentRows(cvData.currentEmployment),
              ...this.createMainLevelParagraph(paragraphContentSec6),
              this.createBaseParagraph(''),
              ...this.createEmploymentRows(cvData.previousWorkExperience),
              ...this.createMainLevelParagraph(paragraphContentSec7),
              ...this.createMainLevelParagraph(paragraphContentSec8),
              this.createBaseParagraph(''),
              ...this.createFundingRows(cvData.researchFundingAndGrants),
              ...this.createMainLevelParagraph(paragraphContentSec9),
              this.createBaseParagraph(''),
              ...this.createDatasetRows(cvData.researchDatasets),
              ...this.createMainLevelParagraph(paragraphContentSec10),
              ...this.createMainLevelParagraph(paragraphContentSec11),
              ...this.createMainLevelParagraph(paragraphContentSec12),
              ...this.createMainLevelParagraph(paragraphContentSec13),
              ...this.createActivityRows(cvData.activities, ['12.1'], true, lang),
              ...this.createActivityRows(cvData.activities, ['9'], true, lang),
              ...this.createActivityRows(cvData.activities, ['8.2.1', '8.3.1', '8.4.1'], true, lang),
              ...this.createActivityRows(cvData.activities, ['8.5.1'], true, lang),
              ...this.createActivityRows(cvData.activities, ['5.1', '5.2', '5.5', '5.6', '5.7', '5.8', '8.1'], true, lang),
              ...this.createActivityRows(cvData.activities, ['3.1.2', '3.2.1'], true, lang),
              ...this.createActivityRows(cvData.activities, ['8.5.1'], true, lang),
              ...this.createActivityRows(cvData.activities, ['2.1'], true, lang),
              ...this.createActivityRows(cvData.activities, ['2.3', '2.4'], true, lang),
              ...this.createActivityRows(cvData.activities, ['1'], true, lang),
              ...this.createActivityRows(cvData.activities, ['5.3', '5.4', '5.5', '5.6'], true, lang),
              ...this.createActivityRows(cvData.activities, ['8.6.1', '8.6.2', '8.6.3'], true, lang),
              ...this.createActivityRows(cvData.activities, ['10'], true, lang),
              ...this.createMainLevelParagraph(paragraphContentSec14),
              ...this.createActivityRows(cvData.activities, ['4', '5'], true, lang),
              ...this.createMainLevelParagraph(paragraphContentSec15),
              ...this.createActivityRows(cvData.activities, ['14', '6'], true, lang)
            ]
          }
        ]
      });
      return cvTemplate;
    } else {
      // PUBLICATION LIST TEMPLATE
      const publicationListTemplate = new docx.Document({
        styles: {
          default: {
            heading1: {
              run: {
                font: 'Calibri',
                size: 52,
                bold: true,
                color: '000000'
              },
              paragraph: {
                alignment: AlignmentType.CENTER,
                spacing: { line: 276, before: 20 * 72 * 0.1, after: 20 * 72 * 0.05 }
              }
            },
            heading2: {
              run: {
                font: 'Calibri',
                size: 26,
                bold: true
              },
              paragraph: {
                spacing: { line: 276, before: 30 * 72 * 0.1, after: 20 * 72 * 0.05 }
              }
            }
          },
          paragraphStyles: [
            {
              id: 'baseParagraphBlue',
              name: 'Blue base paragraph',
              basedOn: 'Normal',
              next: 'Normal',
              run: {
                font: 'Calibri',
                color: '66A4FB'
              },
              paragraph: {
                spacing: { line: 276 }
              }
            },
            {
              id: 'baseParagraphBlack',
              name: 'Black base paragraph',
              basedOn: 'Normal',
              next: 'Normal',
              run: {
                font: 'Calibri',
                color: '000000'
              },
              paragraph: {
                spacing: { line: 276 }
              }
            },
            {
              id: 'baseParagraphRed',
              name: 'Red base paragraph',
              basedOn: 'Normal',
              next: 'Normal',
              run: {
                font: 'Calibri',
                color: 'ff0000'
              },
              paragraph: {
                spacing: { line: 276 }
              }
            }
          ]

        },
        sections: [
          {
            properties: {},
            children: [
              this.createHeading(this.getTranslation('publication_list_title')),

              this.createBaseParagraphBlue(this.getTranslation('publication_list_preface1')),
              this.createBaseParagraph(this.getTranslation('')),
              this.createBulletBlue(this.getTranslation('publication_list_bullet1')),

              // Citation validation is disabled
              //this.createBulletBlue(this.getTranslation('publication_list_bullet2')),
              ...this.createPublicationRows(cvData.publications, citationStyle)
            ]
          }
        ]
      });
      return publicationListTemplate;
    }
  }

  private comparePublicationYearsPublications(a, b) {
    if (a.publicationYear === undefined) {
      a.publicationYear = 0;
    }
    if (b.publicationYear === undefined) {
      b.publicationYear = 0;
    }
    return a.publicationYear - b.publicationYear;
  }

  private formatPublicationCitation(publication: any, citationStyle: number) {
    let publicationDoiStr = publication['doi']?.length > 0 ? ' doi: ' + publication['doi'] : '';

    if (publication.dataSources[0].registeredDataSource === 'ORCID') {
      if (citationStyle === 0) {
        const publicationYearStrApa = publication['publicationYear']?.length > 0 ? ' (' + publication['publicationYear'] + ').' : '';
        const publicationNameStrApa = publication['publicationName']?.length > 0 ? ' ' + publication['publicationName'] + '.' : '';
        return publication['authorsText'] + publicationYearStrApa + publicationNameStrApa + publicationDoiStr;
      } else if (citationStyle === 1) {
        const publicationYearStrChicago = publication['publicationYear']?.length > 0 ? publication['publicationYear'] + '. ' : '';
        const publicationNameStrChicago = publication['publicationName']?.length > 0 ? ' "' + publication['publicationName'] + '"' : '';
        return publication['authorsText'] + publicationYearStrChicago + publicationNameStrChicago + publicationDoiStr;
      } else if (citationStyle === 2) {
        const publicationYearStrMla = publication['publicationYear']?.length > 0 ? ', ' + publication['publicationYear'] + '.' : '';
        const publicationNameStrMla = publication['publicationName']?.length > 0 ? ' "' + publication['publicationName'] + '"' : '';
        return publication['authorsText'] + publicationNameStrMla + publicationYearStrMla + publicationDoiStr;
      }
    } else {
      let citationString = this.adaptCitation(publication, citationStyle);
      citationString = citationString.replaceAll('<i>', '');
      citationString = citationString.replaceAll('</i>', '');
      return citationString;
    }
    return '';
  }

  private createPublicationRows(publicationsData, citationStyle: number) {
    let orcidPublications = [];
    let ttvPublications = [];
    let formattedPublications: docx.Paragraph[] = [];

    publicationsData.forEach((publication) => {
      if (publication.dataSources[0].registeredDataSource === 'ORCID') {
        orcidPublications.push(publication);
      } else {
        ttvPublications.push(publication);
      }
    });

    orcidPublications = orcidPublications.sort(this.comparePublicationYearsPublications).reverse();
    ttvPublications = ttvPublications.sort(this.comparePublicationYearsPublications).reverse();

    formattedPublications.push(this.createBaseParagraph(''));

    ttvPublications.forEach((publication) => {
      formattedPublications.push(this.createBaseParagraph(this.formatPublicationCitation(publication, citationStyle)));
      formattedPublications.push(this.createBaseParagraph(''));
    });

    formattedPublications = formattedPublications.concat(this.createBulletBlue(this.getTranslation('publication_list_bullet_orcid')));
    formattedPublications.push(this.createBaseParagraph(''));

    orcidPublications.forEach((publication) => {
      formattedPublications.push(this.createBaseParagraph(this.formatPublicationCitation(publication, citationStyle)));
      formattedPublications.push(this.createBaseParagraph(''));
    });

    return formattedPublications;
  }

  private createDegreesRows(degreeData) {
    let ret: docx.Paragraph[] = [];

    degreeData.forEach((degree) => {
      if (degree['name'] && degree['degreeGrantingInstitutionName']) {
        ret.push(this.createBaseParagraph(degree['timing']));
        ret.push(this.createBaseParagraph(degree['name']));
        ret.push(this.createBaseParagraph(degree['degreeGrantingInstitutionName']));
        ret.push(this.createBaseParagraph(''));
      }
    });
    return ret;
  }

  private createEmploymentRows(employmentData) {
    let ret: docx.Paragraph[] = [];

    employmentData.forEach((employment) => {
      if (employment['organizationName'] || employment['positionName']) {
        ret.push(this.createBaseParagraph(employment?.timing));
        ret.push(this.createBaseParagraph(employment['organizationName']));
        employment['positionName'] ? ret.push(this.createBaseParagraph(employment['positionName'])) : undefined;
        employment['departmentName'] ? ret.push(this.createBaseParagraph(employment['departmentName'])) : undefined;
        ret.push(this.createBaseParagraph(''));
      }
    });
    return ret;
  }

  private createDatasetRows(datasetData) {
    let ret: docx.Paragraph[] = [];

    datasetData.forEach((dataset) => {
      let year = '';
      if (dataset['year']) {
        year = dataset['year'].toString();
      }

      if (dataset['name']?.length > 0) {
        const datasetName: any = this.capitalizeFirstLetter(dataset['name']);
        ret.push(this.createBaseParagraph(datasetName + ' ' + year));
        if (dataset['doi']?.length > 0) {
          const doiLink = 'https://doi.org/' + dataset['doi'];
          ret.push(this.createHyperlink(doiLink, doiLink));
        } else if (dataset['urn']?.length > 0) {
          ret.push(this.createHyperlink('https://urn.fi/' + dataset['urn'], 'https://urn.fi/' + dataset['urn']));
        } else if (dataset['fairdataUrl']?.length > 0) {
          const datasetUrl = dataset['fairdataUrl'];
          ret.push(this.createHyperlink(datasetUrl, datasetUrl));
        } else if (dataset['url']?.length > 0) {
          const orcidUrl = dataset['url'];
          ret.push(this.createHyperlink(orcidUrl, orcidUrl));
        }
        ret.push(this.createBaseParagraph(''));
      }
    });
    return ret;
  }

  private createFundingRows(fundingData) {
    let ret: docx.Paragraph[] = [];

    fundingData.forEach((funding) => {
      if (funding['name']) {
        if (funding['year']) {
          ret.push(this.createBaseParagraph(funding['year'].toString()));
        }
        if (funding['funder']?.typeOfFundingName?.length > 0) {
          const funderName: string = <string>this.capitalizeFirstLetter((funding['funder'].typeOfFundingName).toString());
          ret.push(this.createBaseParagraph(funderName));
        }
        if (funding['funder']?.name?.length > 0) {
          const funderName: string = <string>this.capitalizeFirstLetter((funding['funder'].name).toString());
          ret.push(this.createBaseParagraph(funderName));
        }
        if (funding['name']?.length > 0) {
          ret.push(this.createBaseParagraph(funding['name']));
        }
        ret.push(this.createBaseParagraph(''));
      }
    });
    return ret;
  }

  private createActivityRows(activityData, activityCodes: string[], includeSubclasses: boolean, lang: string) {
    const langCapitalized = lang[0].toUpperCase() + lang.slice(1);
    let ret: docx.Paragraph[] = [];
    activityCodes.forEach((activityCode) => {
      activityData.forEach((activity) => {
        if (includeSubclasses) {
          if (activity?.activityTypeCode?.startsWith(activityCode)) {
            ret.push(this.createBaseParagraph(''));
            if (activity['timing']?.length > 0) {
              ret.push(this.createBaseParagraph(activity['timing']));
            }
            if (activity['activityTypeName' + langCapitalized]?.length > 0) {
              const activityType: any = this.capitalizeFirstLetter(activity['activityTypeName' + langCapitalized]);
              ret.push(this.createBaseParagraph(activityType));
            }
            if (activity['roleName' + langCapitalized]?.length > 0) {
              const activityType: any = this.capitalizeFirstLetter(activity['roleName' + langCapitalized]);
              ret.push(this.createBaseParagraph(activityType));
            }
            if (activity['name' + langCapitalized]?.length > 0) {
              ret.push(this.createBaseParagraph(activity['name' + langCapitalized]));
            }
            if (activity['organizationName' + langCapitalized]?.length > 0) {
              ret.push(this.createBaseParagraph(activity['organizationName' + langCapitalized]));
            }
            if (activity['departmentName' + langCapitalized]?.length > 0) {
              ret.push(this.createBaseParagraph(activity['departmentName' + langCapitalized]));
            }
            if (activity['positionName' + langCapitalized]?.length > 0) {
              ret.push(this.createBaseParagraph(activity['positionName' + langCapitalized]));
            }
          }
        } else {
          if (activity?.activityTypeCode === activityCode) {
            ret.push(this.createBaseParagraph(''));
            if (activity['timing']?.length > 0) {
              ret.push(this.createBaseParagraph(activity['timing']));
            }
            if (activity['activityTypeName' + langCapitalized]?.length > 0) {
              const activityType: any = this.capitalizeFirstLetter(activity['activityTypeName' + langCapitalized]);
              ret.push(this.createBaseParagraph(activityType));
            }
            if (activity['roleName' + langCapitalized]?.length > 0) {
              const activityType: any = this.capitalizeFirstLetter(activity['roleName' + langCapitalized]);
              ret.push(this.createBaseParagraph(activityType));
            }
            if (activity['name' + langCapitalized]?.length > 0) {
              ret.push(this.createBaseParagraph(activity['name' + langCapitalized]));
            }
            if (activity['organizationName' + langCapitalized]?.length > 0) {
              ret.push(this.createBaseParagraph(activity['organizationName' + langCapitalized]));
            }
            if (activity['departmentName' + langCapitalized]?.length > 0) {
              ret.push(this.createBaseParagraph(activity['departmentName' + langCapitalized]));
            }
            if (activity['positionName' + langCapitalized]?.length > 0) {
              ret.push(this.createBaseParagraph(activity['positionName' + langCapitalized]));
            }
          }
        }

      });
    });

    return ret;
  }

  private capitalizeFirstLetter(value: any): unknown {
    if (!value || value.length === 0) {
      return '';
    }
    return (value[0].toUpperCase() + value.slice(1)).toString();
  }

  public createHeading(text: string): Paragraph {
    return new Paragraph({
      text: text,
      heading: HeadingLevel.HEADING_1
    });
  }

  private createMainLevelParagraph(elements: cvTopLevelParagraph) {
    let ret: docx.Paragraph[] = [];

    ret.push(new docx.Paragraph({
      text: elements.paragraphTitle,
      heading: HeadingLevel.HEADING_2,
      style: 'heading2'
    }));

    if (elements.bulletsList) {
      elements.bulletsList.forEach(bullet => {
        ret.push(this.createBulletBlue(bullet));
      });
    }

    if (elements.bulletsAfter) {
      ret.push(this.createBaseParagraph(''));
      ret.push(this.createBaseParagraph(elements.bulletsAfter));
    }

    return ret;
  }

  public createBaseParagraph(text: string): Paragraph {
    return new Paragraph({
      text: text,
      style: 'baseParagraphBlack',
      indent: { left: 350 }
    });
  }

  public createBaseParagraphBlue(text: string): Paragraph {
    return new Paragraph({
      text: text,
      style: 'baseParagraphBlue',
      indent: { left: 350 }
    });
  }

  public createBaseParagraphRed(text: string): Paragraph {
    return new Paragraph({
      text: text,
      style: 'baseParagraphRed',
      indent: { left: 350 }
    });
  }

  public createHyperlink(text: string, link: string): Paragraph {
    return new Paragraph({
      indent: { left: 350 },
      style: 'baseParagraphBlack',
      children: [
        new ExternalHyperlink({
          children: [
            new TextRun({
              text: text,
              style: 'Hyperlink'
            })
          ],
          link: link
        })
      ]
    });
  }

  public createHyperlinkMidText(textBefore: string, linkText: string, link: string, textAfter: string): Paragraph {
    return new Paragraph({
      style: 'baseParagraphBlue',
      children: [
        new TextRun({
          text: textBefore + ' ',
          style: 'baseParagraphBlue'
        }),
        new ExternalHyperlink({
          children: [
            new TextRun({
              text: linkText,
              style: 'Hyperlink'
            })
          ],
          link: link
        }),
        new TextRun({
          text: ' ' + textAfter,
          style: 'baseParagraphBlue'
        })]
    });
  }

  public createHyperlinkMidTextBulleted(textBefore: string, linkText: string, link: string, textAfter: string): Paragraph {
    return new Paragraph({
      style: 'baseParagraphBlue',
      bullet: {
        level: 0
      },
      children: [
        new TextRun({
          text: textBefore + ' ',
          style: 'baseParagraphBlue'
        }),
        new ExternalHyperlink({
          children: [
            new TextRun({
              text: linkText,
              style: 'Hyperlink'
            })
          ],
          link: link
        }),
        new TextRun({
          text: ' ' + textAfter,
          style: 'baseParagraphBlue'
        })]
    });
  }


  public createBulletBlue(text: string): Paragraph {
    return new Paragraph({
      text: text,
      style: 'baseParagraphBlue',
      bullet: {
        level: 0
      }
    });
  }
}
