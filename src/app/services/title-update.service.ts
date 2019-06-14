import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TitleUpdateService {

  private tabSource = new BehaviorSubject({data: 'julkaisut', label: 'Julkaisut'});
  currentTab = this.tabSource.asObservable();

  constructor() { }

  changeTitle(tab: {data: string; label: string}) {
    this.tabSource.next(tab);
  }
}
