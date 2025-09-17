import { cloneDeep } from 'lodash-es';
import { UtilityService } from '@shared/services/utility.service';
import { FieldTypes as fieldTypes } from '@mydata/constants/fieldTypes';
import { GroupTypes as groupTypes } from '@mydata/constants/groupTypes';

export function convertToProfileToolFormat(profile: any, localeId: string) {
  const descriptionCaption = $localize`:@@descriptionOfResearch:Tutkimustoiminnan kuvaus`;
  const keywordsCaption = $localize`:@@keywords:Avainsanat`;
  const affiliationsCaption = $localize`:@@affiliations:Affiliaatiot`;
  const educationCaption = $localize`:@@education:Koulutus`;
  const otherNamesCaption = $localize`:@@otherNames:Muut nimet`;
  const datasetsCaption = $localize`:@@datasets:Tutkimusaineistot`;
  const activitiesAndRewardsCaption = $localize`:@@activitiesAndAwards:Aktiviteetit ja palkinnot`;
  const collaborationCaption = $localize`:@@collaborationHeader:Yhteistyö`;
  const grantedFundingCaption = $localize`:@@funding:Myönnetty rahoitus`
  const publicationsCaption = $localize`:@@publications:Julkaisut`;
  const organizationCaption = $localize`:@@organization:Organisaatio`;
  const departmentCaption =  $localize`:@@department:Yksikkö`;
  const internationalCollaborationCaption = $localize`:@@internationalCollaboration:Kansainvälinen yhteistyö`
  const dataSourcesCaption = $localize`:@@dataSources:Lähteet`;

  if (profile) {
    const profileFormattedTemp = [];

    // 1/10 --- CONTACT
    const contact = [];

    // OTHER NAMES
    let typedOtherNames = cloneDeep(profile.personal.otherNames);
    typedOtherNames = typedOtherNames.map(item => {
      item.itemMeta = { type: fieldTypes.personOtherNames, show: true };
      return item;
    });

    const otherNames = {
      id: 'otherNames',
      label: otherNamesCaption,
      items: typedOtherNames
    };
    contact.push(otherNames);

    // EMAIL
    let typedEmails = cloneDeep(profile.personal.emails);
    typedEmails = typedEmails.map(item => {
      item.itemMeta = { type: fieldTypes.personEmailAddress, show: true };
      return item;
    });
    const emails = {
      id: 'email',
      label:$localize`:@@email:Sähköposti`,
      items: typedEmails
    };
    contact.push(emails);

    // WEBLINKS
    let typedWebLinks = cloneDeep(profile.personal.webLinks);
    typedWebLinks = typedWebLinks.map(item => {
      item.itemMeta = { type: fieldTypes.personWebLink, show: true };
      return item;
    });
    const links = {
      id: 'webLinks',
      label: $localize`:@@links:Linkit`,
      items: cloneDeep(typedWebLinks)
    };
    contact.push(links);

    profileFormattedTemp.push({
      id: 'contact', label: $localize`:@@contactInfo:Yhteystiedot`, fields: contact
    });

    // 2/10 --- DESCRIPTION
    cloneDeep(profile.personal.researcherDescriptions[0]);
    const description = {
      id: 'description',
      label: descriptionCaption,
      fields: [],
    };
    const descriptionTyped = [];
    const itemMeta = { show: true, type: 140 };
    descriptionTyped.push(cloneDeep(profile.personal.researcherDescriptions[0]));
    if (descriptionTyped[0]) {
      descriptionTyped[0].itemMeta = itemMeta;
      descriptionTyped[0].value = checkTranslation('researchDescription', profile.personal.researcherDescriptions[0], localeId);
    }

    // KEYWORDS
    const keywordsTyped = profile.personal.keywords.map(item => {
      item.itemMeta = { show: true, type: fieldTypes.personKeyword };
      return item;
    });

    description.fields.push({
      id: 'researchDescription',
      label: $localize`:@@description:Kuvaus`,
      items: cloneDeep(descriptionTyped),
      keywordItems: { id: 'keywords', label: keywordsCaption, items: keywordsTyped }
    });
    profileFormattedTemp.push(description);

    // 3/10 --- AFFILIATIONS
    let typedAffiliations = cloneDeep(profile.activity.affiliations);
    typedAffiliations = typedAffiliations.map(item => {
      item.itemMeta = item.itemMeta?.primaryValue === true ? { type: fieldTypes.activityAffiliation, show: true, primaryValue: true } : { type: fieldTypes.activityAffiliation, show: true };
      return item;
    });
    const affiliationObj = {
      id: groupTypes.affiliation, label: affiliationsCaption, fields: [{
        id: 'affiliation', label: affiliationsCaption, items: typedAffiliations
      }]
    };
    profileFormattedTemp.push(affiliationObj);

    // 4/10 --- EDUCATION
    let typedEducation = cloneDeep(profile.activity.educations);
    typedEducation = typedEducation.map(item => {
      item.itemMeta = { type: fieldTypes.activityEducation, show: true };
      return item;
    });

    const educationObj = {
      id: groupTypes.education, label: educationCaption, fields: [{
        id: 'education', label: educationCaption, items: typedEducation
      }]
    };
    profileFormattedTemp.push(educationObj);

    // 5/10 --- PUBLICATION
    let typedPublications = cloneDeep(profile.activity.publications);
    typedPublications = typedPublications.map(item => {
      item.itemMeta = { type: fieldTypes.activityPublication, show: true };
      item.id = item.publicationId;
      item.title = item.publicationName;
      return item;
    });

    const publication = {
      id: groupTypes.publication,
      label: publicationsCaption,
      fields: [{ id: 'publication', label: publicationsCaption, items: typedPublications }]
    };
    profileFormattedTemp.push(publication);

    // 6/10 --- DATASET
    let typedDatasets = cloneDeep(profile.activity.researchDatasets);
    typedDatasets = typedDatasets.map(item => {
      item.itemMeta = { type: fieldTypes.activityDataset, show: true };
      item.name = checkTranslation('name', item, localeId);
      item.id = item.identifier;
      item.description = checkTranslation('description', item, localeId);
      item.year = item.datasetCreated;
      return item;
    });
    const dataset = {
      id: groupTypes.dataset,
      label: datasetsCaption,
      fields: [{ id: 'dataset', label: datasetsCaption, items: typedDatasets }]
    };
    profileFormattedTemp.push(dataset);

    // 7/10 --- FUNDING
    let typedFundings = cloneDeep(profile.activity.fundingDecisions);
    typedFundings = typedFundings.map(item => {
      item.id = item.projectId
      item.name = checkTranslation('projectName', item, localeId);
      item.funder = {};
      item.funder.name = checkTranslation('funderName', item, localeId);
      item.year = item?.fundingStartYear + ' - ' + item?.fundingEndYear;
      item.itemMeta = { type: fieldTypes.activityFunding, show: true };
      item.startYear = item?.fundingStartYear;
      item.endYear = item?.fundingEndYear;

      return item;
    });

    const funding = {
      id: groupTypes.funding,
      label: grantedFundingCaption,
      fields: [{ id: 'funding', label: grantedFundingCaption, items: typedFundings }]
    };
    profileFormattedTemp.push(funding);

    // 8/10 --- ACTIVITIES AND REWARDS
    let typedAcitivities = cloneDeep(profile.activity.activitiesAndRewards);
    typedAcitivities = formatActivityItems(typedAcitivities, localeId);

    const activities = {
      id: groupTypes.activitiesAndRewards,
      label: activitiesAndRewardsCaption,
      fields: [{
        id: 'activitiesAndRewards',
        label: activitiesAndRewardsCaption,
        items: cloneDeep(typedAcitivities)
      }]
    };
    profileFormattedTemp.push(activities);

    // 9/10 --- COOPERATION
    const allOptionsSelected = profile?.cooperation?.map(item => {
      item.selected = true;
      return item;
    });

    const cooperationObj = {
      id: 'cooperation',
      label: collaborationCaption,
      fields: allOptionsSelected
    };
    profileFormattedTemp.push(cooperationObj);

    // 10/10 --- NAMES
    let typedNames = cloneDeep(profile.personal.names);
    typedNames = typedNames.map(item => {
      item.itemMeta = { type: fieldTypes.personName, show: true };
      return item;
    });

    const names = {
      id: 'name',
      label: $localize`:@@name:Nimi`,
      fields: [{ id: 'name', label: $localize`:@@name:Nimi`, items: typedNames }]
    };
    profileFormattedTemp.push(names);

    const orcid = {
      id: 'orcid',
      label: 'Orcid',
      value: profile.id
    };
    profileFormattedTemp.push(orcid);

    profileFormattedTemp.push({settings: {'highlightOpenness': profile.settings?.highlightOpeness}})

    const uniqueDatasourcesStr = profile?.uniqueDataSources?.map((item) => checkTranslation('name', item.organization, localeId)).sort().join(', ');

    const uniqueDataSources = {
      id: 'uniqueDataSources',
      label: 'Data sources',
      value: (uniqueDatasourcesStr ? uniqueDatasourcesStr : '')
    };
    profileFormattedTemp.push(uniqueDataSources);

    return profileFormattedTemp;
  }
}

function formatActivityItems(items: any, localeId: string){
  items = items.map(item => {
    item.itemMeta = { type: fieldTypes.activityActivitiesAndRewards, show: true };
    return item;
  });
  return items;
}

// Point of language test is to populate data if no content available in current locale.
function checkTranslation(field, item, localeId) {
  //console.log('!!!!! checking translation', field, item, localeId);
  if (!item) {
    return undefined;
  }
  // Change locale to field name format
  const capitalizedLocale =
    localeId.charAt(0).toUpperCase() + localeId.slice(1);
  // Get the content based on the current locale
  const content = item[field + capitalizedLocale]?.toString()?.trim() || '';
  // Check if the original locale has valuable content
  const contentIsValid = UtilityService.stringHasContent(content);

  // Dont perform checks if content is valid
  if (contentIsValid) {
    return content;
  }
  // Return content based on locale and priority if field doesn't exist in its original locale
  let res;
  switch (localeId) {
    case 'fi': {
      res = UtilityService.stringHasContent(item[field + 'En'])
        ? item[field + 'En']
        : item[field + 'Sv'];
      break;
    }
    case 'en': {
      res = UtilityService.stringHasContent(item[field + 'Fi'])
        ? item[field + 'Fi']
        : item[field + 'Sv'];
      break;
    }
    case 'sv': {
      res = UtilityService.stringHasContent(item[field + 'En'])
        ? item[field + 'En']
        : item[field + 'Fi'];
      break;
    }
  }
  // If still no content and Und exists, take that
  res =
    !UtilityService.stringHasContent(res) && item[field + 'Und']
      ? item[field + 'Und']
      : res;
  return res;
}