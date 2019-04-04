import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Publication, PublicationAdapter } from '../../models/publication.model';
import { Observable } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PublicationService {

  private baseUrl = '/api/julkaisut/haku?julkaisuVuosi=2019&organisaatioTunnus=01901&&lehdenNimi=Nature';
  public items: any = [];

  constructor( private http: HttpClient, private adapter: PublicationAdapter, ) {}

  list(): Observable<Publication[]> {
    const url = `${this.baseUrl}/`;
    return this.http.get(url)
    .pipe(
      // Adapt each item in the raw data array
      map((data: any[]) => data.map(item => this.adapter.adapt(item))),
    );
  }

}
