import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TabChangeService {
  tabData = [
    { data: 'julkaisut', label: 'Julkaisut', link: 'publications' },
    { data: 'tutkijat',  label: 'Tutkijat', link: 'persons' },
    { data: 'hankkeet', label: 'Rahoitetut hankkeet', link: 'fundings' },
    { data: '', label: 'Tutkimusaineistot', link: '1' },
    { data: '', label: 'Tutkimusinfrastruktuurit', link: '2' },
    { data: '', label: 'Muut tutkimusaktiviteetit', link: '3' },
    { data: '', label: 'Tutkimusorganisaatiot', link: '4' }
  ];

  private tabSource = new BehaviorSubject({data: 'julkaisut', label: 'Julkaisut'});
  currentTab = this.tabSource.asObservable();

  constructor() { }

  changeTab(tab: {data: string; label: string}) {
    this.tabSource.next(tab);
  }
}
