// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { faEnvelope, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { Person } from '@portal/models/person/person.model';
import { Search } from '@portal/models/search.model';
import { SearchService } from '@portal/services/search.service';
import { SingleItemService } from '@portal/services/single-item.service';
import { TabChangeService } from '@portal/services/tab-change.service';
import { UtilityService } from '@shared/services/utility.service';
import { take } from 'rxjs';
import { DOCUMENT } from '@angular/common';

type Field = { key: string; label?: string };

@Component({
  selector: 'app-single-person',
  templateUrl: './single-person.component.html',
  styleUrls: ['./single-person.component.scss'],
})
export class SinglePersonComponent implements OnInit {
  responseData: Search;
  tabQueryParams: any;
  searchTerm: string;
  tabData: any;
  tab = 'person';

  descriptionFields: Field[] = [
    {
      key: 'description',
      label: 'Tutkimustoiminnan kuvaus',
    },
    {
      key: 'fieldsOfScience',
      label: 'Tieteenalat',
    },
    {
      key: 'keywords',
      label: 'Avainsanat',
    },
  ];

  affiliationFields: Field[] = [
    { key: 'departmentName', label: 'Yksikkö' },
    { key: 'positionName', label: 'Nimike' },
    { key: 'communityName', label: 'Tutkimusyhteisö' }, // Not implemented yet
    { key: 'role', label: 'Rooli tutkimusyhteisössä' }, // Not implemented yet
  ];

  publicationFields = [{ key: 'name' }, { key: 'year' }, { key: 'doi' }];

  datasetFields = [{ key: 'name' }, { key: 'year' }];

  contactFields: Field[] = [
    { key: 'emails' },
    { key: 'links' },
    { key: 'otherNames', label: 'Muut nimet' },
  ];

  person: Person;

  initialItemCount = 3;

  maxPublicationCount = this.initialItemCount;
  showAllPublications = false;

  maxDatasetCount = this.initialItemCount;
  showAllDatasets = false;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private searchService: SearchService,
    private singleItemService: SingleItemService,
    private utilityService: UtilityService,
    private tabChangeService: TabChangeService,
    @Inject(LOCALE_ID) protected localeId: string,
    @Inject(DOCUMENT) private document: any
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(take(1)).subscribe((params) => {
      this.searchService.searchTerm = params.id;
      this.getData(params.id);
      this.searchService.searchTerm = ''; // Empty search term so breadcrumb link is correct
    });

    this.tabQueryParams = this.tabChangeService.tabQueryParams.persons;
    this.tabData = this.tabChangeService.tabData.find(
      (item) => item.data === 'persons'
    );
  }

  public setTitle(newTitle: string) {
    this.utilityService.setTitle(newTitle);
  }

  getData(id: string) {
    this.singleItemService
      .getSinglePerson(id)
      .pipe(take(1))
      .subscribe((result) => {
        this.responseData = result;

        const personRes = result.persons[0];
        this.person = personRes;

        if (personRes) {
          this.setTitle(
            `${personRes.name} - ${$localize`:@@appName:Tiedejatutkimus.fi`}`
          );
        }
      });
  }

  showEmail(event, address) {
    const span = this.document.createElement('span');
    span.innerHTML = address;
    event.target.replaceWith(span);
  }
}
