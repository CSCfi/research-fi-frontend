import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Publication } from '../../models/publication.model';
import { PublicationService } from './publication.service';
import { of } from 'rxjs';
import {
  debounceTime,
  map,
  distinctUntilChanged,
  filter
} from 'rxjs/operators';
import { fromEvent } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

const PARAMS = new HttpParams({
  fromObject: {
    action: 'opensearch',
    format: 'json',
    origin: '*'
  }
});

@Component({
  selector: 'app-publications',
  templateUrl: './publications.component.html',
  styleUrls: ['./publications.component.scss']
})
export class PublicationsComponent implements OnInit {
  @ViewChild('publicationSearchInput') publicationSearchInput: ElementRef;
  apiResponse: any;
  isSearching: boolean;
  publications: Publication[];

  constructor(private publicationService: PublicationService, private httpClient: HttpClient) {
    this.isSearching = false;
    this.apiResponse = [];
    this.publications = [];
  }

  ngOnInit() {

    this.publicationService.list().subscribe((publications: Publication[]) => {
      this.publications = publications;
    });

    fromEvent(this.publicationSearchInput.nativeElement, 'keyup').pipe(
      // get value
      map((event: any) => {
        return event.target.value;
      }),
      // if character length greater then 1
      filter(res => res.length > 1),
      // Time in milliseconds between key events
      debounceTime(1000),
      // If previous query is diffent from current
      distinctUntilChanged()
      // subscription for response
      ).subscribe((text: string) => {
        this.isSearching = true;
        this.searchGetCall(text).subscribe((res) => {
          console.log('res', res);
          this.isSearching = false;
          this.apiResponse = res;
        }, (err) => {
          this.isSearching = false;
          console.log('error', err);
        });
      });

  }

  searchGetCall(term: string) {
    if (term === '') {
      return of([]);
    }
    return this.httpClient.get('/api/julkaisut/haku?julkaisuVuosi=2019&organisaatioTunnus=01901&&lehdenNimi=Nature&julkaisunNimi=' + term);
  }

}
