//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ProfileService } from '@mydata/services/profile.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-delete-profile-dialog',
  templateUrl: './delete-profile-dialog.component.html',
})
export class DeleteProfileDialogComponent {
  loading: boolean;
  connProblem: boolean;

  constructor(
    private profileService: ProfileService,
    private dialogRef: MatDialogRef<DeleteProfileDialogComponent>
  ) {}

  deleteProfile() {
    this.connProblem = false;
    this.loading = true;
    this.profileService
      .deleteProfile()
      .pipe(take(1))
      .subscribe(
        (res: any) => {
          this.loading = false;
          if (res.ok && res.body.success) {
            this.dialogRef.close(true);
          }
        },
        (error) => {
          this.loading = false;
          if (!error.ok) {
            this.connProblem = true;
          }
        }
      );
  }

  close() {
    this.dialogRef.close();
  }
}
