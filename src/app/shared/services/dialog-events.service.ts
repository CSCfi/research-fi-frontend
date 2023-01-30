import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DialogEventsService {
  private quickstartState$ = new BehaviorSubject<boolean>(false);

  constructor() {}

  getQuickstartState() {
    return this.quickstartState$.asObservable();
  }

  setQuickstartState(state: boolean) {
    this.quickstartState$.next(state);
  }
}
