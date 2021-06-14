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
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  @Input() placeholder: string;
  @Input() initialTerm: string;

  @Output() getSearchTerm = new EventEmitter<boolean>();
  @Output() resetSearch = new EventEmitter<boolean>();

  searchForm = this.formBuilder.group({
    term: '',
  });

  faSearch = faSearch;

  @ViewChild('searchInput') searchInput: ElementRef;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    if (this.initialTerm)
      this.searchForm.controls['term'].setValue(this.initialTerm);
  }

  reset() {
    this.searchForm.reset();
    this.resetSearch.emit(true);
  }

  onSubmit(): void {
    const searchTerm = this.searchForm.get('term').value;

    this.getSearchTerm.emit(searchTerm);
  }
}
