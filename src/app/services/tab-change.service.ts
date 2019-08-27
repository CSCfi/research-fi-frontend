import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TabChangeService {
  tabData = [
    { data: 'publications', label: 'Julkaisut', link: 'publications' },
    { data: 'persons',  label: 'Tutkijat', link: 'persons' },
    { data: 'fundings', label: 'Rahoitetut hankkeet', link: 'fundings' },
    { data: '', label: 'Tutkimusaineistot', link: '1' },
    { data: '', label: 'Tutkimusinfrastruktuurit', link: '2' },
    { data: '', label: 'Muut tutkimusaktiviteetit', link: '3' },
    { data: 'organizations', label: 'Tutkimusorganisaatiot', link: 'organizations' }
  ];

  private tabSource = new BehaviorSubject({data: '', label: '', link: ''});
  currentTab = this.tabSource.asObservable();
  tab: string;
  tabQueryParams: any = {};

  constructor() { }

  changeTab(tab: {data: string; label: string, link: string}) {
    this.tab = tab.link;
    this.tabSource.next(tab);
  }
}
