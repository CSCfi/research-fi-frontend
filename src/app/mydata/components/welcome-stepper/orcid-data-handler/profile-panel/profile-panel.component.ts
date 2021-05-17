//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile-panel',
  templateUrl: './profile-panel.component.html',
  styleUrls: ['./profile-panel.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProfilePanelComponent implements OnInit {
  @Input() dataSources: any;
  @Input() selectedSource: string;
  @Input() data: any;

  @Output() onToggle = new EventEmitter<any>();

  allSelected: boolean;

  checked: any[];
  mobileStatusSub: Subscription;

  /*
   * appSettingsService is used in Template
   */
  constructor(private appSettingsService: AppSettingsService) {}

  ngOnInit(): void {
    this.checked = [this.selectedSource];
  }

  toggleField(index: number) {
    this.onToggle.emit(index);
  }
}
