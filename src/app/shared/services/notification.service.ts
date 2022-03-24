import { Injectable } from '@angular/core';
import { NotificationObject } from '@shared/types';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationSource = new Subject<any>();
  notificationObject = this.notificationSource.asObservable();

  constructor() {}

  public notificate(notificationObject: NotificationObject) {
    this.notificationSource.next(notificationObject);
  }

  public clearNotification() {
    this.notificationSource.next(null);
  }
}
