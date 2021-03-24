import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { StaticDataService } from 'src/app/portal/services/static-data.service';
import { isPlatformBrowser } from '@angular/common';
import { ErrorHandlerService } from '@shared/services/error-handler.service';

@Component({
  selector: 'app-error-modal',
  templateUrl: './error-modal.component.html',
  styleUrls: ['./error-modal.component.scss'],
})
export class ErrorModalComponent implements OnInit {
  @ViewChild('errorModal', { static: true }) private modal: TemplateRef<any>;
  errorSub: Subscription;
  modalRef: BsModalRef;
  error: HttpErrorResponse;
  isBrowser: boolean;

  constructor(
    private modalService: BsModalService,
    private errorHandlerService: ErrorHandlerService,
    private utilityService: UtilityService,
    public staticDataService: StaticDataService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    this.errorSub = this.errorHandlerService.currentError.subscribe((error) => {
      this.error = error;
      // Only allow a single modal to be active at a time
      if (isPlatformBrowser(this.platformId)) {
        if (!this.utilityService.modalOpen) {
          this.openModal(this.modal);
        }
      }
    });
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  closeModal() {
    this.modalRef.hide();
  }

  preventTab(event) {
    UtilityService.preventTab(event);
  }
}
