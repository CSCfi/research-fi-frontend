import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Publication, PublicationAdapter } from '../models/publication.model';
import { Observable } from 'rxjs';
import {  map } from 'rxjs/operators';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class PublicationService {

  private baseUrl = API_URL + 'publication_name=information';
  public items: any = [];

  constructor( private http: HttpClient, private adapter: PublicationAdapter ) {}

  list(): Observable<Publication[]> {
    const url = `${this.baseUrl}`;
    return this.http.get(url).pipe(
      map((data: any[]) => data.map(item => this.adapter.adapt(item))),
    );
  }

}
