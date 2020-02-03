import { Component, OnInit, OnDestroy } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap';
import { InterceptService } from 'src/app/services/intercept.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-error-modal',
  templateUrl: './error-modal.component.html',
  styleUrls: ['./error-modal.component.scss']
})
export class ErrorModalComponent implements OnInit, OnDestroy {

  errorSub: Subscription;

  constructor(private modalService: BsModalService, private interceptService: InterceptService) { }

  ngOnInit() {
    this.errorSub = this.interceptService.currentError.subscribe(err => {
      console.log(err);
    });
  }

  ngOnDestroy() {
    this.errorSub.unsubscribe();
  }
}
