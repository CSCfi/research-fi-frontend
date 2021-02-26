// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-beta-info',
  templateUrl: './beta-info.component.html',
  styleUrls: ['./beta-info.component.scss'],
})
export class BetaInfoComponent implements OnInit {
  constructor(private dialogRef: MatDialogRef<BetaInfoComponent>) {}

  ngOnInit(): void {}

  close() {
    this.dialogRef.close();
  }
}
