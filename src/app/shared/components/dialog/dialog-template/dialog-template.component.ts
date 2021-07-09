import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-dialog-template',
  templateUrl: './dialog-template.component.html',
  styleUrls: ['./dialog-template.component.scss'],
})
export class DialogTemplateComponent implements OnInit {
  mobile: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DialogTemplateComponent>,
    private appSettingsService: AppSettingsService
  ) {}

  ngOnInit(): void {
    this.appSettingsService.mobileStatus
      .pipe(take(1))
      .subscribe((status) => (this.mobile = status));
  }

  doAction(method) {
    this.dialogRef.close({
      method: method,
    });
  }

  close() {
    this.dialogRef.close();
  }
}
