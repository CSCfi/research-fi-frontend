import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ProfileService } from '@mydata/services/profile.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-delete-profile-dialog',
  templateUrl: './delete-profile-dialog.component.html',
})
export class DeleteProfileDialogComponent {
  constructor(
    private profileService: ProfileService,
    private router: Router,
    private dialogRef: MatDialogRef<DeleteProfileDialogComponent>
  ) {}

  deleteProfile() {
    this.profileService
      .deleteProfile()
      .pipe(take(1))
      .subscribe((data) => {
        this.router.navigate(['/mydata']);
        this.dialogRef.close();
      });
  }

  close() {
    this.dialogRef.close();
  }
}
