import { Component, OnInit, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { Subscription, Observable, throwError } from 'rxjs';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { DataService } from 'src/app/services/data.service';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-error-modal',
  templateUrl: './error-modal.component.html',
  styleUrls: ['./error-modal.component.scss']
})
export class ErrorModalComponent implements OnInit {

  @ViewChild('errorModal', {static: true}) private modal: TemplateRef<any>;
  errorSub: Subscription;
  modalRef: BsModalRef;
  error: HttpErrorResponse;


  constructor(private modalService: BsModalService, private dataService: DataService) { }

  ngOnInit() {
    this.errorSub = this.dataService.currentError.subscribe(error => {
      this.error = error;
      this.openModal(this.modal);
    });
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  closeModal(template: TemplateRef<any>) {
    this.modalRef.hide();
  }

  preventTab(event) {
    UtilityService.preventTab(event);
  }

}
