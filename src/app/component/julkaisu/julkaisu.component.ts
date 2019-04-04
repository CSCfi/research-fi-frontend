import { Component, OnInit } from '@angular/core';
import { SearchService } from './search.service';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-julkaisu',
  templateUrl: './julkaisu.component.html',
  styleUrls: ['./julkaisu.component.scss']
})

export class JulkaisuComponent implements OnInit {
  results: any = [];
  queryField: FormControl = new FormControl();

  constructor(private searchService: SearchService) { }

  ngOnInit() {
  this.queryField.valueChanges
  .pipe(debounceTime(500))
  .subscribe( result => console.log(result));
  }
 }
