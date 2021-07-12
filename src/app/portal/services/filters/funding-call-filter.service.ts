import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class FundingCallFilterService {
  filterData = [
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
      field: 'status',
      label: $localize`:@@fundincCallStatus:Rahoitushaun tila`,
      hasSubFields: false,
      open: true,
      limitHeight: true,
      // tooltip: $localize`:@@fundingCallStatusTooltip:Tutkimustietovarannossa hakuja seurataan päivän tarkkuudella. Haun päättymisen kellonaika kerrotaan hakuilmoituksessa tai rahoittajan palvelussa.`
    },
    {
      field: 'field',
      label: $localize`:@@fundingCallCategory:Hakuala`,
      hasSubFields: false,
      open: true,
      limitHeight: true,
      tooltip: $localize`:@@fundingCallCategoryTooltip:Tieteen ja taiteen rahoitustietokanta Auroran hakualakoodiston mukaiset hakualat vastaavat suurelta osin tieteenaloja.`
    },
    {
      field: 'organization',
      label: $localize`:@@funder:Rahoittaja`,
      hasSubFields: false,
      open: true,
      limitHeight: true,
      tooltip: $localize`:@@fundingCallFunderTooltip:Rahoitushausta vastaava tutkimusrahoittaja.`
    },
  ];

  singleFilterData = [];


  constructor() {}

  shapeData(data) {
    const source = data.aggregations;
    // Organization
    this.organization(source.organization);
    // Field of science
    source.field = this.field(source.field.field);
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
  
  field(data) {
    data.buckets.map((item) => {
      item.label = item.key;
      item.key = item.fieldId.buckets[0]?.key;
      item.id = item.key;
      item.doc_count = item.filtered.filterCount.doc_count;
    });
    // Don't show empty fields
    data.buckets = data.buckets.filter(x => x.doc_count);
    // Sort by category name
    data.buckets.sort((a, b) => +(a.label > b.label) - 0.5);

    // Add extra field for active-filters
    const cp = cloneDeep(data.buckets);
    cp.forEach(f => f.key = f.label);
    data.fields = {buckets: cp};

    return data;
  }

  status(data) {
    const dates = data.buckets;
    let openDocs = 0;
    let closedDocs = 0;
    let futureDocs = 0;
    let continuousDocs = 0;
    
    const now = new Date().toLocaleDateString('sv');

    // Continuous
    dates.filter(date => date.key.dueDate === '1900-01-01').forEach(date => continuousDocs += date.filtered.doc_count);
    // Open
    dates.filter(date => date.key.openDate < now && date.key.dueDate > now).forEach(date => openDocs += date.filtered.doc_count);
    // Closed
    dates.filter(date => date.key.dueDate < now && date.key.dueDate !== '1900-01-01').forEach(date => closedDocs += date.filtered.doc_count);
    // Future
    dates.filter(date => date.key.openDate > now).forEach(date => futureDocs += date.filtered.doc_count);

    const buckets = [
      {label: $localize`:@@openFundingCalls:Avoimet haut`, key: 'open', doc_count: openDocs + continuousDocs},
      {label: $localize`:@@closedFundingCalls:Menneet haut`, key: 'closed', doc_count: closedDocs},
      {label: $localize`:@@futureFundingCalls:Tulevat haut`, key: 'future', doc_count: futureDocs},
      // {label: $localize`:@@continuousFundingCalls:Jatkuvat haut`, key: 'continuous', doc_count: continuousDocs},
    ]
    return buckets;
  }
} 
