import { checkTranslation as checkTranslation } from '@portal/models/person/profiletool-person-adapter';
import { cloneDeep } from 'lodash-es';
import { GroupTypes } from '@mydata/constants/groupTypes';
import * as translations from '@mydata/components/cv-tool/cv-template-builder/CvTranslations';

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


function getDateNow() {
  let d = new Date(),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  return [day, month, year].join('.');
}


const groupTypes = GroupTypes;

function formatAndSortTimeSpan(data: any, dataType: string, langCode: string): unknown {

  const presentLocalization = translations.getTranslation(langCode, 'present_term');

  if (data) {
    let items = cloneDeep(data);

    if (dataType === groupTypes.funding) {
      items = items.map(item => {
        item.startDate = { year: item.startYear ? item.startYear : 0 };
        item.endDate = { year: item.endYear ? item.endYear : 0 };
        return item;
      });
    }

    items = items.sort(customSortByEndDates);
    items = items.sort(customSortByStartDatesWhenEndDatesSame);

    items = items.map(item => {
      // Show single year
      if (item.startDate.year === item.endDate.year) {
        if (item.endDate.year === 0) {
          item.timing = '';
        } else {
          item.timing = item.startDate.year.toString();
        }
      }
      // Start date missing
      else if (item.startDate.year === 0) {
        if (item.endDate.year > 0) {
          item.timing = item.endDate.year.toString();
        }
        // Start and end date missing
        else {
          item.timing = '';
        }
        // End date missing
      } else if (item.endDate.year === 0) {
        item.timing = item.startDate.year.toString();
        if (dataType === groupTypes.education || dataType === groupTypes.affiliation) {
          item.timing = item.timing + ' - ' + presentLocalization;
          if (dataType === groupTypes.affiliation) {
            item.employmentContinues = true;
          }
        }
        if (dataType === groupTypes.affiliation) {
          item.employmentContinues = true;
        }
      }
      // Regular case
      else {
        let startDate = '';
        let endDate = '';
        if (item.startDate.month) {
          startDate = item.startDate.month + '/' + item.startDate.year;
        } else {
          startDate = item.startDate.year.toString();
        }
        if (item.endDate.month) {
          endDate = item.endDate.month + '/' + item.endDate.year;
        } else {
          endDate = item.endDate.year.toString();
        }
        item.timing = startDate + ' - ' + endDate;
      }
      return item;
    });

    // Sort items with empty timing to last
    const timingExists = [];
    const noTiming = [];
    items.forEach(item => {
      if (item.timing === '') {
        noTiming.push(item);
      } else {
        timingExists.push(item);
      }
    });
    items = timingExists.concat(noTiming);
    return items ? items : [];
  }
}

function customSortDatasetPublicationYears(a, b) {
  if (a?.year === 0 && b?.year === 0) {
    // Both are missing years
    return 0;
  }
  if (a?.year > 0 && b?.year > 0) {
    // Both have positive years
    return a.year > b.year ? -1 : a.year < b.year ? 1 : 0;
  }
  // Other end year is present
  else if (a?.year > 0) {
    return -1;
  } else return 1;
}

function customSortByEndDates(a, b) {
  if (a.endDate.year === 0 && b.endDate.year === 0) {
    // Both are missing end years
    return 0;
  }
  if (a.endDate.year > 0 && b.endDate.year > 0) {
    // Both have end years
    return a.endDate.year > b.endDate.year ? -1 : a.endDate.year < b.endDate.year ? 1 : 0;
  }
  // Other end year is present
  else if (a.endDate.year > 0) {
    return 1;
  } else return -1;
}

function customSortByStartDatesWhenEndDatesSame(a, b) {
  if (a.endDate.year === b.endDate.year) {
    // Only sort when end years are the same
    if (a.startDate.year === 0 && b.startDate.year === 0) {
      // Both are missing start years
      return 0;
    }
    if (a.endDate.year > 0 && b.endDate.year > 0) {
      // Both have positive end years
      return a.startDate.year > b.startDate.year ? 1 : a.startDate.year < b.startDate.year ? -1 : 0;
    }
    // Other start year is present
    else if (a.startDate.year > 0) {
      return 1;
    } else return -1;
  } else return 0;
}

export function formatCvData(lang: string, profileData, orcid: string, filterVisible: boolean) {

  let visibleNames = profileData[0].fields[0].items.filter(item => filterVisible ? item.itemMeta.show === true : item);

  let affiliations = profileData[2].fields[0].items.filter(item => filterVisible ? item.itemMeta.show === true : item);

  let formattedAffiliations = formatAndSortTimeSpan(affiliations, groupTypes.affiliation, lang);

  // @ts-ignore
  let parsedAffiliations = formattedAffiliations.map(item => {
    item.name = checkTranslation('name', item, lang) ?? '';
    item.organizationName = checkTranslation('organizationName', item, lang) ?? '';
    return item;
  });

  let currentEmployment = [];
  let previousWorkExperience = [];
  parsedAffiliations.forEach(affiliation => {
    if (affiliation.itemMeta.primaryValue === true || affiliation.employmentContinues) {
      currentEmployment.push(affiliation);
    } else {
      previousWorkExperience.push(affiliation);
    }
  });

  let parsedEducation = profileData[3].fields[0].items.filter(item => filterVisible ? item.itemMeta.show === true : item);

  let formattedEducation = formatAndSortTimeSpan(parsedEducation, groupTypes.education, lang);

  // @ts-ignore
  parsedEducation = formattedEducation.map(item => {
    item.name = checkTranslation('name', item, lang) ?? '';
    return item;
  });

  let parsedPublications = filterVisible === true ? profileData[4].fields[0].items.filter(item => item.itemMeta.show === true) : profileData[4].fields[0].items;

  let parsedDatasets = profileData[5].fields[0].items.filter(item => filterVisible === true ? profileData[4].fields[0].items : item);

  parsedDatasets = parsedDatasets.sort(customSortDatasetPublicationYears);

  let parsedFundings = profileData[6].fields[0].items.filter(item => filterVisible ? item.itemMeta.show === true : item);

  parsedFundings = formatAndSortTimeSpan(parsedFundings, groupTypes.funding, lang);

  let parsedActivities = profileData[7].fields[0].items.filter(item => filterVisible ? item.itemMeta.show === true : item);

  parsedActivities = formatAndSortTimeSpan(parsedActivities, groupTypes.activitiesAndRewards, lang);

  let formattedData: cvDataFormatted = {
    awardsAndHonors: [],
    currentEmployment: currentEmployment,
    degrees: parsedEducation,
    firstNames: visibleNames[0].firstNames,
    lastName: visibleNames[0].lastName,
    orcid: 'https://orcid.org/' + orcid,
    date: getDateNow(),
    otherEducationAndExpertise: [],
    previousWorkExperience: previousWorkExperience,
    publications: parsedPublications,
    researchDatasets: parsedDatasets,
    researchFundingAndGrants: parsedFundings,
    activities: parsedActivities,
    researchSupervisionAndLeadershipExperience: [],
    teachingMerits: []
  };

  return formattedData;
}

