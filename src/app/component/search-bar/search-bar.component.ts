import { Component, ViewChild, ElementRef, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SearchService } from '../../services/search.service';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

const API_URL = environment.apiUrl;

@Component({
    selector: 'app-search-bar',
    templateUrl: './search-bar.component.html',
    styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit, AfterViewInit {
    @ViewChild('publicationSearchInput') publicationSearchInput: ElementRef;
    apiResponse: any;
    status = false;
    input: string;
    restItems: any[] = [];
    restItemsUrl = API_URL;

    constructor( private searchService: SearchService, private router: Router, private cdr: ChangeDetectorRef ) {
    }

    ngOnInit() {
      this.searchService.currentInput.subscribe(input => this.input = input);
    }

    // firstComponentFunction() {
    //   this.searchService.onFirstComponentButtonClick();
    // }

    onKeydown(event) {
      console.log(event);
    }

    increaseEvent() {
        this.status = !this.status;
    }

    newInput() {
      this.searchService.changeInput(this.publicationSearchInput.nativeElement.value);
      // this.router.navigate(['/results', this.publicationSearchInput.nativeElement.value]);
      this.searchService.onFirstComponentButtonClick();
    }

    ngAfterViewInit() {
      // //Clear input field after search button click
      // this.publicationSearchInput.nativeElement.value = '';
      // this.input = '';
      // this.cdr.detectChanges();
    }

}
