// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  AfterViewInit,
} from '@angular/core';
import { UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PrimaryActionButtonComponent } from '../buttons/primary-action-button/primary-action-button.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        NgIf,
        TooltipModule,
        PrimaryActionButtonComponent,
    ],
})
export class SearchComponent implements OnInit, AfterViewInit {
  @Input() placeholder: string;
  @Input() initialTerm: string;
  @Input() autofocus: boolean;

  @Output() getSearchTerm = new EventEmitter<string>();
  @Output() resetSearch = new EventEmitter<boolean>();

  searchForm = this.formBuilder.group({
    term: '',
  });


  @ViewChild('searchInput') searchInput: ElementRef;

  constructor(private formBuilder: UntypedFormBuilder) {}

  ngOnInit(): void {
    if (this.initialTerm)
      this.searchForm.controls['term'].setValue(this.initialTerm);
  }

  ngAfterViewInit(): void {
    if (this.autofocus) {
      this.searchInput.nativeElement.focus();
    }
  }

  reset() {
    this.searchForm.reset();
    this.resetSearch.emit(true);
    setTimeout(() => {
      this.searchInput.nativeElement.focus();
    }, 0);
  }

  onSubmit(): void {
    const searchTerm = this.searchForm.get('term').value;

    this.getSearchTerm.emit(searchTerm);
  }
}
