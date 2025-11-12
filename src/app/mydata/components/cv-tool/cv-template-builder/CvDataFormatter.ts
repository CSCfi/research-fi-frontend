import { checkTranslation as checkTranslation} from '@portal/models/person/profiletool-person-adapter';
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

    const presentLocalization =  translations.getTranslation(langCode, 'present_term');

    if (data) {
      let items = cloneDeep(data);

      if (dataType === groupTypes.funding) {
        items = items.map(item => {
          item.startDate = {year: item.startYear ? item.startYear : 0};
          item.endDate = {year: item.endYear ? item.endYear : 0};
          return item;
        });
      }

      items = items.sort(customSort);

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
          if (dataType === groupTypes.activitiesAndRewards || dataType === groupTypes.education) {
            item.timing = item.timing + ' - ' + presentLocalization;
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
        }
        else {
          timingExists.push(item);
        }
      });
      items = timingExists.concat(noTiming);
      return items ? items : [];
    }
  }


function customSort(a, b) {
  // Return comparison in reversed order
  if (a.endDate.year === 0 && b.endDate.year === 0) {
    // Both are missing end years, so sort by start year
    return a.startDate.year > b.startDate.year ? -1 : a.startDate.year < b.startDate.year ? 1 : 0;
  }
  if (a.endDate.year > 0 && b.endDate.year > 0) {
    // Both have end years
    return a.endDate.year > b.endDate.year ? -1 : a.endDate.year < b.endDate.year ? 1 : 0;
  }
  // Other end year is present
  else if (a.endDate.year > 0) {
    // B is "present day" (bigger)
    return 1;
  } // A is "present day" (bigger)
  else return -1;
}

export function formatCvData(lang: string, profileData, orcid: string, filterVisible: boolean) {
  console.log('formatCvData', JSON.stringify(profileData), filterVisible);

  let visibleNames = profileData[0].fields[0].items.filter(item => filterVisible ? item.itemMeta.show === true : item);

  let affiliations = profileData[2].fields[0].items.filter(item => filterVisible ? item.itemMeta.show === true : item);

  let formattedAffiliations = formatAndSortTimeSpan(affiliations, groupTypes.affiliation, lang);

  // @ts-ignore
  let parsedAffiliations = formattedAffiliations.map(item => {
    item.name = checkTranslation('name', item, lang) ?? '';
    item.organizationName = checkTranslation('organizationName', item, lang) ?? '';
    return item;
  });


  let primaryAffiliations = [];
  let nonPrimaryAffiliations = [];
  parsedAffiliations.forEach(affiliation => {
    if (affiliation.itemMeta.primaryValue === true) {
      primaryAffiliations.push(affiliation);
    }
    else {
      nonPrimaryAffiliations.push(affiliation);
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

  let parsedDatasets = profileData[5].fields[0].items.filter(item =>  filterVisible === true ? profileData[4].fields[0].items : item);
  parsedDatasets = parsedDatasets.map(item => {
    item.name = checkTranslation('name', item, lang) ?? '';
    return item;
  });

  let parsedFundings = profileData[6].fields[0].items.filter(item => filterVisible ? item.itemMeta.show === true : item);
  parsedFundings = parsedFundings.map(item => {
    item.name = checkTranslation('projectName', item, lang) ?? '';
    item.funder.name = checkTranslation('funderName', item, lang) ?? '';
    return item;
  });


  let parsedActivities = profileData[7].fields[0].items.filter(item => filterVisible ? item.itemMeta.show === true : item);

  parsedActivities = formatAndSortTimeSpan(parsedActivities, groupTypes.activitiesAndRewards, lang);

  let formattedData: cvDataFormatted = {
    awardsAndHonors: [],
    currentEmployment: primaryAffiliations,
    degrees: parsedEducation,
    firstNames: visibleNames[0].firstNames,
    lastName: visibleNames[0].lastName,
    orcid: 'https://orcid.org/' + orcid,
    date: getDateNow(),
    otherEducationAndExpertise: [],
    previousWorkExperience: nonPrimaryAffiliations,
    publications: parsedPublications,
    researchDatasets: parsedDatasets,
    researchFundingAndGrants: parsedFundings,
    activities: parsedActivities,
    researchSupervisionAndLeadershipExperience: [],
    teachingMerits: []
  }

  return formattedData;
}

