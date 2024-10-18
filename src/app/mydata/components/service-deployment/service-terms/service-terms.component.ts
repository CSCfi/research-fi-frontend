import { Component, OnInit, TemplateRef } from '@angular/core';
import { CommonStrings } from '@mydata/constants/strings';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { NgIf } from '@angular/common';
import { PrimaryActionButtonComponent } from '../../../../shared/components/buttons/primary-action-button/primary-action-button.component';
import { MyDataTerms } from '../../mydata-terms/mydata-terms.component';
import { FormsModule } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
    selector: 'app-service-terms',
    templateUrl: './service-terms.component.html',
    styleUrls: ['./service-terms.component.scss'],
    standalone: true,
    imports: [
        MatCheckbox,
        FormsModule,
        MyDataTerms,
        PrimaryActionButtonComponent,
        NgIf,
        DialogComponent,
    ],
})
export class ServiceTermsComponent implements OnInit {
  dialogTitle: string;
  termsApproved = false;
  personalDataHandlingApproved = false;
  continueWithSuomiFiLogin = $localize`:@@continueWithSuomiFiLogin:Jatka tunnistautumalla (Suomi.fi)`;

  showDialog: boolean;
  dialogTemplate: TemplateRef<any>;
  dialogActions = [
    { label: $localize`:@@close:Sulje`, primary: true, method: 'close' },
  ];

  termsForTool = CommonStrings.termsForTool;
  processingOfPersonalData = CommonStrings.processingOfPersonalData;

  constructor(private oidcSecurityService: OidcSecurityService) {}

  ngOnInit(): void {}

  authenticate() {
    this.oidcSecurityService.authorize();
  }

  openDialog(title, template) {
    this.dialogTitle = title;
    this.showDialog = true;
    this.dialogTemplate = template;
  }
}
