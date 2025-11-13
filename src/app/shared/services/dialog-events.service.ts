import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Constants } from '@mydata/constants';
import { AppSettingsService } from '@shared/services/app-settings.service';

@Injectable({
  providedIn: 'root'
})
export class DialogEventsService {
  private quickstartState$ = new BehaviorSubject<boolean>(false);
  private discardChangesModalVisibleState$ = new BehaviorSubject<boolean>(false);
  private discardChangesAndLogoutRequested$ = new BehaviorSubject<boolean>(false);

  constructor(private appSettingsService: AppSettingsService,) {}

  getQuickstartState() {
    return this.quickstartState$.asObservable();
  }

  setQuickstartState(state: boolean) {
    this.quickstartState$.next(state);
  }

  getDiscardChangesModalVisibleState() {
    return this.discardChangesModalVisibleState$.asObservable();
  }

  setDiscardChangesModalVisibleState(visible: boolean) {
    this.discardChangesModalVisibleState$.next(visible);
  }

  discardChangesAndLogout(){
    this.discardChangesAndLogoutRequested$.next(true);
    this.discardChangesAndLogoutRequested$.next(false);
    this.setDiscardChangesModalVisibleState(false);
  }

  getDiscardChangesAndLogoutRequestedSubject(){
    return this.discardChangesAndLogoutRequested$;
  }

  changesDiscarded() {
    this.setDiscardChangesModalVisibleState(false);
    this.discardChangesAndLogoutRequested$.next(false);
  }
}
