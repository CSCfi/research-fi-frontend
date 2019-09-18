import { Injectable, LOCALE_ID, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TabChangeService {
  tabData = [
    { data: 'publications', labelFi: 'Julkaisut', labelEn: 'Publications', link: 'publications' },
    { data: 'persons',  labelFi: 'Tutkijat', labelEn: 'People', link: 'persons' },
    { data: 'fundings', labelFi: 'Rahoitetut hankkeet', labelEn: 'Fundings', link: 'fundings' },
    { data: '', labelFi: 'Tutkimusaineistot', labelEn: 'Materials', link: '1' },
    { data: '', labelFi: 'Tutkimusinfrastruktuurit', labelEn: 'Infrastructures', link: '2' },
    { data: '', labelFi: 'Muut tutkimusaktiviteetit', labelEn: 'Research activities', link: '3' },
    { data: 'organizations', labelFi: 'Tutkimusorganisaatiot', labelEn: 'Organizations', link: 'organizations' }
  ];

  private tabSource = new BehaviorSubject({data: '', labelFi: '', labelEn: '', link: ''});
  currentTab = this.tabSource.asObservable();
  tab: string;
  tabQueryParams: any = {};
  locale: string;

  constructor( @Inject( LOCALE_ID ) protected localeId: string ) {

   }

  changeTab(tab: {data: string; labelFi: string, labelEn: string, link: string}) {
    this.tab = tab.link;
    this.tabSource.next(tab);
  }
}
