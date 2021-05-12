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
  OnChanges,
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
export class ProfilePanelComponent implements OnInit, OnChanges {
  @Input() dataSources: any;
  @Input() selectedSource: string;
  @Input() data: any;

  @Output() dataChange = new EventEmitter<object>();

  allSelected: boolean;

  checked: any[];
  mobileStatusSub: Subscription;

  constructor(private appSettingsService: AppSettingsService) {}

  ngOnInit(): void {
    this.checked = [this.selectedSource];
  }

  ngOnChanges() {
    console.log(this.data);
  }

  toggleField(index: number) {
    this.data.fields[index].show = !this.data.fields[index].show;

    // Pass change to parent
    this.dataChange.emit(this.data);
  }
}