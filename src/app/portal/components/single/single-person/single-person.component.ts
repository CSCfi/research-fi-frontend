// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Person } from '@portal/models/person/person.model';
import { Search } from '@portal/models/search.model';
import { SearchService } from '@portal/services/search.service';
import { SingleItemService } from '@portal/services/single-item.service';
import { TabChangeService } from '@portal/services/tab-change.service';
import { UtilityService } from '@shared/services/utility.service';

import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map, switchMap, take } from 'rxjs/operators';

import { DOCUMENT, NgIf, NgFor, NgTemplateOutlet, NgClass, AsyncPipe, JsonPipe } from '@angular/common';
import { PersonPublication } from '@portal/models/person/person-publication.model';
import { CheckEmptyFieldsPipe } from '../../../pipes/check-empty-fields.pipe';
import { JoinItemsPipe } from '../../../../shared/pipes/join-items.pipe';
import { ShareComponent } from '../share/share.component';
import { RelatedLinksComponent } from '../related-links/related-links.component';
import { SingleResultLinkComponent } from '../single-result-link/single-result-link.component';
import { MatCard, MatCardTitle } from '@angular/material/card';
import { PersonGroupComponent } from './person-group/person-group.component';
import { TagDoiComponent } from '../../../../shared/components/tags/tag-doi/tag-doi.component';
import { BreadcrumbComponent } from '../../breadcrumb/breadcrumb.component';
import { SearchBarComponent } from '../../search-bar/search-bar.component';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';
import {
  PersonProfileViewComponent
} from '@mydata/components/profile/person-profile-view/person-profile-view.component';
import { cloneDeep } from 'lodash-es';
import { FieldTypes } from '@mydata/constants/fieldTypes';
import { GroupTypes } from '@mydata/constants/groupTypes';
import {
  CollaborationCardComponent
} from '@mydata/components/profile/cards/collaboration-card/collaboration-card.component';
import { ContactCardComponent } from '@mydata/components/profile/cards/contact-card/contact-card.component';
import { MydataBetaInfoComponent } from '@mydata/components/mydata-beta-info/mydata-beta-info.component';
import {
  MydataSideNavigationComponent
} from '@mydata/components/mydata-side-navigation/mydata-side-navigation.component';

import { convertToProfileToolFormat as convertToProfileToolFormat} from '@portal/models/person/profiletool-person-adapter';
import { RelatedLinksNewComponent } from '@portal/components/single/related-links-new/related-links-new.component';
import {
  DataSourcesInfoCardComponent
} from '@portal/components/single/single-person/data-sources-info-card/data-sources-info-card.component';

type Field = { key: string; label?: string };

@Component({
    selector: 'app-single-person',
    templateUrl: './single-person.component.html',
    styleUrls: ['./single-person.component.scss'],
    imports: [
        SearchBarComponent,
        NgIf,
        RouterLink,
        BreadcrumbComponent,
        AsyncPipe,
        JoinItemsPipe,
        JsonPipe,
        PersonProfileViewComponent,
        CollaborationCardComponent,
        ContactCardComponent,
        MatCard,
        RelatedLinksComponent,
        RelatedLinksNewComponent,
        DataSourcesInfoCardComponent
    ]
})
export class SinglePersonComponent implements OnInit {
  protected readonly groupTypes = GroupTypes;
  protected readonly fieldTypes = FieldTypes;

  responseData: Search;
  tabQueryParams: any;
  searchTerm: string;
  tabData: any;
  tab = 'persons';

  isEmailVisible = false;

  profileFormatted = undefined;
  profileFormattedTemp = [];

  descriptionFields: Field[] = [
    {
      key: 'description',
      label: $localize`:@@descriptionOfResearch:Tutkimustoiminnan kuvaus`
    },
    // {
    //   key: 'fieldsOfScience',
    //   label: 'Tieteenalat',
    // },
    {
      key: 'keywords',
      label: $localize`:@@keywords:Avainsanat`
    }
  ];

  affiliationFields: Field[] = [
    { key: 'departmentName', label: $localize`:@@unit:Yksikkö` },
    { key: 'positionName', label: $localize`:@@title:Nimike` },
    { key: 'communityName', label: 'Tutkimusyhteisö' }, // Not implemented yet
    { key: 'role', label: 'Rooli tutkimusyhteisössä' } // Not implemented yet
  ];

  publicationFields = [{ key: 'name' }, { key: 'year' }, { key: 'doi' }];

  datasetFields = [{ key: 'name' }, { key: 'year' }];

  fundingFields = [{ key: 'name' }, { key: 'funderName' }, { key: 'year' }];

  person$: Observable<Person>;
  sortedPublications$: Observable<PersonPublication[]>;

  initialItemCount = 3;

  maxPublicationCount = this.initialItemCount;

  maxDatasetCount = this.initialItemCount;
  showAllDatasets = false;

  maxFundingCount = this.initialItemCount;
  showAllFundings = false;

  maxActivityAndAwardsCount = this.initialItemCount;
  showAllActivityAndAwards = false;

  profileNotFound$ = new BehaviorSubject(false);

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private searchService: SearchService,
    private singleItemService: SingleItemService,
    private utilityService: UtilityService,
    private tabChangeService: TabChangeService,
    @Inject(LOCALE_ID) protected localeId: string,
    @Inject(DOCUMENT) private document: any
  ) {
  }

  ngOnInit(): void {
    this.person$ = this.route.params.pipe(switchMap((params) => {
      const id = params['id'];
      this.getDataRaw(id);
      return this.singleItemService.getSinglePerson(id).pipe(map((search) => {
        return search.persons[0] as Person;
      }));
    }));

    this.route.params.pipe(take(1)).subscribe((params) => {
      if (this.searchService.searchTerm == null) {
        this.searchService.searchTerm = params.id;
        //this.profileFormatted = this.getDataRaw(params.id);
        this.searchService.searchTerm = ''; // Empty search term so breadcrumb link is correct
      }
    });

    this.searchTerm = this.searchService.searchTerm;

    this.tabQueryParams = this.tabChangeService.tabQueryParams.persons;
    this.tabData = this.tabChangeService.tabData.find(
      (item) => item.data === 'persons'
    );
  }

  public setTitle(newTitle: string) {
    this.utilityService.setTitle(newTitle);
  }

  getDataRaw(id: string) {
    this.singleItemService
      .getSinglePersonRawData(id).subscribe((result: any) => {
      if (result.hits.hits.length > 0) {
        this.profileFormatted = convertToProfileToolFormat(result.hits.hits[0]._source, this.localeId);
      }
      else {
        this.profileNotFound$.next(true);
      }
    });
  }

  showEmail() {
    this.isEmailVisible = true;
  }

  showMorePublications() {
    // Take one value from person and assign its publication length to maxPublicationCount
    this.person$.pipe(take(1)).subscribe((person) => {
      this.maxPublicationCount = person.publications.length;
    });
  }
}
