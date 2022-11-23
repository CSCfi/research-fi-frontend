import { Component, OnInit, TemplateRef } from '@angular/core';
import { CommonStrings } from '@mydata/constants/strings';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
  selector: 'app-service-terms',
  templateUrl: './service-terms.component.html',
  styleUrls: ['./service-terms.component.scss'],
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
