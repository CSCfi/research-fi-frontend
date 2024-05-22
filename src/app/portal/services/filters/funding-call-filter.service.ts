import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { FilterConfigType } from 'src/types';

@Injectable({
  providedIn: 'root',
})
export class FundingCallFilterService {
  filterData: FilterConfigType[] = [
    {
      field: 'status',
      label: $localize`:@@fundingCallStatus:Rahoitushaun tila`,
      hasSubFields: false,
      open: true,
      limitHeight: true,
      // tooltip: $localize`:@@fundingCallStatusTooltip:Tutkimustietovarannossa hakuja seurataan päivän tarkkuudella. Haun päättymisen kellonaika kerrotaan hakuilmoituksessa tai rahoittajan palvelussa.`
    },
    {
      field: 'date',
      label: $localize`:@@applicationPeriod:Hakuaika`,
      hasSubFields: false,
      open: true,
      limitHeight: true,
      hideSearch: true,
      hideNoResults: true,
      tooltip: $localize`:@@fundingCallPeriodTooltip:Aika, jolloin rahoitushaku on käynnissä. Voit rajata hakuaikaa rahoitushaun alkamis- ja päättymispäivämäärän tai vuoden mukaan.`,
    },
    {
      field: 'field',
      label: $localize`:@@fundingCallCategory:Hakuala`,
      hasSubFields: false,
      open: true,
      limitHeight: true,
      tooltip: $localize`:@@fundingCallCategoryTooltip:Tieteen ja taiteen rahoitustietokanta Auroran hakualakoodiston mukaiset hakualat vastaavat suurelta osin tieteenaloja.`,
    },
    {
      field: 'organization',
      label: $localize`:@@fundingFunder:Rahoittaja`,
      hasSubFields: false,
      open: true,
      limitHeight: true,
      tooltip: $localize`:@@fundingCallFunderTooltip:Rahoitushausta vastaava tutkimusrahoittaja.`,
    },

    // FIN: Rahoitusmuoto
    // EN: Method of funding
    // SWE: Finansieringsmetoden

    // FIN: Rahoitusmuoto kuvaa kenelle tai millaiseen tarkoitukseen haettava rahoitus on tarkoitettu. Ensimmäisessä vaiheessa tietoa rahoitusmuodosta toimittaa Suomen Akatemia, jaottelua laajennetaan muiden rahoittajien avoimiin hakuihin.
    // EN: The method of funding describes for whom or for what purpose the funding is intended. In the first phase, information on the funding instrument will be provided by Research Council of Finland, it will be expanded to other funders open calls later.
    // SWE: Finansieringsmetoden beskriver vem eller för vilket ändamål finansieringen är avsedd. I den första fasen kommer information om finansieringsinstrumentet att tillhandahållas av Finlands Akademi, som senare utvidgas till att omfatta andra finansiärer som öppnar utlysningar.

    {
      field: 'typeOfFundingId',
      label: $localize`:@@fundingType:Rahoitusmuoto`,
      hasSubFields: false,
      open: false,
      limitHeight: true,
      tooltip: $localize`:@@fundingTypeTooltip:Rahoitusmuoto kuvaa kenelle tai millaiseen tarkoitukseen haettava rahoitus on tarkoitettu. Ensimmäisessä vaiheessa tietoa rahoitusmuodosta toimittaa Suomen Akatemia, jaottelua laajennetaan muiden rahoittajien avoimiin hakuihin.`,
    },
  ];

  singleFilterData = [];

  constructor() {}

  shapeData(data) {
    const source = data.aggregations;

    this.organization(source.organization);
    this.typeOfFunding(source.typeOfFundingId)

    // Field of science
    source.field = this.field(source.field?.field);
    // Status
    source.status.buckets = this.status(source.status);
    source.shaped = true;
    return source;
  }

  organization(data) {
    data.buckets = data.orgId.buckets;
    data.buckets.forEach((item) => {
      item.id = item.key;
      item.label = item.orgName.buckets[0]?.key;
      item.doc_count = item.orgName.buckets[0]?.doc_count;
    });
    // Sort by number of docs

    data.buckets.sort((a, b) => b.doc_count - a.doc_count);
  }


  typeOfFunding(data) {
    data.buckets = data.fundingId.buckets;

    for (const item of data.buckets) {
      item.id = item.key;
      item.label = item.fundingNames.buckets[0]?.key;
      item.doc_count = item.fundingNames.buckets[0]?.doc_count;
    }

    // Sort by number of docs

    data.buckets.sort((a, b) => b.doc_count - a.doc_count);
  }



  field(data) {
    if (data) {
      data.buckets.map((item) => {
        item.label = item.key;
        item.key = item.fieldId.buckets[0]?.key;
        item.id = item.key;
        item.doc_count = item.filtered.filterCount.doc_count;
      });

      // Don't show empty fields
      data.buckets = data.buckets.filter((x) => x.doc_count);
      // Sort by category name
      data.buckets.sort((a, b) => +(a.label > b.label) - 0.5);

      // Add extra field for active-filters
      const cp = cloneDeep(data.buckets);
      cp.forEach((f) => (f.key = f.label));
      data.fields = { buckets: cp };
    }
    return data;
  }

  status(data) {
    // Preserve original values to help on doc count calculation when switching
    // between mobile and desktop resolutions
    if (!data.originalData) {
      data.originalData = data.buckets;
    }
    const dates = [...data.originalData];
    let openDocs = 0;
    let closedDocs = 0;

    const now = new Date().toLocaleDateString('sv');

    // Open
    dates
      .filter((date) => date.key.dueDate >= now)
      .forEach((date) => (openDocs += date.filtered.doc_count));
    // Closed
    dates
      .filter((date) => date.key.dueDate < now)
      .forEach((date) => (closedDocs += date.filtered.doc_count));

    const buckets = [
      {
        label: $localize`:@@openCalls:Avoimet haut`,
        key: 'open',
        doc_count: openDocs,
      },
      {
        label: $localize`:@@closedCalls:Päättyneet haut`,
        key: 'closed',
        doc_count: closedDocs,
      },
    ];
    return buckets;
  }
}
