import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabButtonComponent } from '@portal/components/tab-button/tab-button.component';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { AppConfigService } from '@shared/services/app-config-service.service';
import { BreakpointObserver } from '@angular/cdk/layout';

type IndexCounts = { [index: string]: number };
type ButtonData = { label: string, icon: string, route: string, count: number };

@Component({
  selector: 'app-tab-navigation',
  standalone: true,
  imports: [CommonModule, TabButtonComponent],
  templateUrl: './tab-navigation.component.html',
  styleUrls: ['./tab-navigation.component.scss']
})
export class TabNavigationComponent {
  http = inject(HttpClient);
  breakpointObserver = inject(BreakpointObserver);
  appConfigService = inject(AppConfigService);

  url = this.appConfigService.apiUrl + "publication,person,funding,dataset,funding-call,infrastructure,organization/_search?request_cache=true";
  body = {
    "size": 0,
    "aggs": {
      "_index": {
        "filters": {
          "filters": {
            "publications": {
              "match": {
                "_index": "publication"
              }
            },
            "persons": {
              "match": {
                "_index": "person"
              }
            },
            "fundings": {
              "match": {
                "_index": "funding"
              }
            },
            "datasets": {
              "bool": {
                "must": [
                  {
                    "match": {
                      "_index": "dataset"
                    }
                  },
                  {
                    "term": {
                      "isLatestVersion": 1
                    }
                  }
                ]
              }
            },
            "infrastructures": {
              "match": {
                "_index": "infrastructure"
              }
            },
            "organizations": {
              "match": {
                "_index": "organization"
              }
            },
            "fundingCalls": {
              "match": {
                "_index": "funding-call"
              }
            }
          }
        }
      }
    }
  }

  // showAll = false;
  showAll$ = new BehaviorSubject(false);

  counts$: Observable<IndexCounts> = this.http.post(this.url, this.body).pipe(
    map((response: any) => response.aggregations),
    map(aggregations => Object.entries(aggregations._index.buckets)),
    map(buckets => buckets.reduce((acc, [key, value]) => ({ ...acc, [key]: (value as any).doc_count }), {}))
  );

  /*defaultOrderButtons = [
    { label: 'Publications',    icon: 'faFileLines',  route: "/results/publications",    count$: this.counts$.pipe(map(counts => counts.publications)) },
    { label: 'Persons',         icon: 'faUsers',      route: "/results/persons",         count$: this.counts$.pipe(map(counts => counts.persons)) },
    { label: 'Fundings',        icon: 'faBriefcase',  route: "/results/fundings",        count$: this.counts$.pipe(map(counts => counts.fundings)) },
    { label: 'Datasets',        icon: 'faFileAlt',    route: "/results/datasets",        count$: this.counts$.pipe(map(counts => counts.datasets)) },
    { label: 'Funding Calls',   icon: 'faBullhorn',   route: "/results/funding-calls",   count$: this.counts$.pipe(map(counts => counts.fundingCalls)) },
    { label: 'Infrastructures', icon: 'faUniversity', route: "/results/infrastructures", count$: this.counts$.pipe(map(counts => counts.infrastructures)) },
    { label: 'Organizations',   icon: 'faCalculator', route: "/results/organizations",   count$: this.counts$.pipe(map(counts => counts.organizations)) },
  ];*/

  defaultOrderButtons$: Observable<ButtonData[]> = this.counts$.pipe(
    map(counts => [
      { label: 'Publications',    icon: 'faFileLines',  route: "/results/publications",    count: counts.publications },
      { label: 'Persons',         icon: 'faUsers',      route: "/results/persons",         count: counts.persons },
      { label: 'Fundings',        icon: 'faBriefcase',  route: "/results/fundings",        count: counts.fundings },
      { label: 'Datasets',        icon: 'faFileAlt',    route: "/results/datasets",        count: counts.datasets },
      { label: 'Funding Calls',   icon: 'faBullhorn',   route: "/results/funding-calls",   count: counts.fundingCalls },
      { label: 'Infrastructures', icon: 'faUniversity', route: "/results/infrastructures", count: counts.infrastructures },
      { label: 'Organizations',   icon: 'faCalculator', route: "/results/organizations",   count: counts.organizations },
    ])
  );

  // Buttons sorted by the count value
  sortedButtons$: Observable<ButtonData[]> = this.defaultOrderButtons$.pipe(
    map(buttons => buttons.sort((a, b) => b.count - a.count))
  );

  // If the narrowest 768px breakpoint is active use the sorted buttons, otherwise use the default order
  responsiveOrder$: Observable<ButtonData[]> = this.breakpointObserver.observe(['(max-width: 768px)']).pipe(
    switchMap(result => result.matches ? this.sortedButtons$ : this.defaultOrderButtons$)
  );

  responsiveSize$: Observable<number> = this.breakpointObserver.observe(['(min-width: 1200px)', '(min-width: 990px)', '(min-width: 768px)']).pipe(
    map(result => {
      if (result.breakpoints['(min-width: 1200px)']) {
        return 8;
      } else if (result.breakpoints['(min-width: 990px)']) {
        return 3;
      } else if (result.breakpoints['(min-width: 768px)']) {
        return 3;
      } else {
        return 3;
      }
    })
  );

  end$ = combineLatest([this.showAll$, this.responsiveSize$, this.defaultOrderButtons$]).pipe(
    map<[boolean, number, ButtonData[]], number>(([showAll, end, buttons]) => showAll ? buttons.length : end)
  );

  isDesktop$ = this.breakpointObserver.observe(['(min-width: 1200px)']).pipe(
    map(result => result.matches)
  );

  toggleAll() {
    this.showAll$.next(!this.showAll$.value);
  }

  trackByLabel(index: number, button: ButtonData) {
    return button.label;
  }
}
