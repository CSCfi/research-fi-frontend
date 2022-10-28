import { Injectable } from '@angular/core';
import { NotificationObject } from '@shared/types';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationSource = new BehaviorSubject<NotificationObject>(null);
  notificationObject = this.notificationSource.asObservable();

  constructor() {}

  public notify(notificationObject: NotificationObject) {
    this.notificationSource.next(notificationObject);
  }

  public clearNotification() {
    this.notificationSource.next(null);
  }
}
