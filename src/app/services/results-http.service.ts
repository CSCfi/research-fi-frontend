import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/internal/Observable';
import {map} from 'rxjs/operators';
import {Search} from '../models/search.model';
import {environment} from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})

export class ResultsHttpService {
    url: string;

    constructor(private httpClient: HttpClient) {
      this.url = environment.apiUrl;
    }

    getPublications(): Observable<Search[]> {
      return this.httpClient.get('./assets/test.json').pipe(map(response => {
        return response as Search[];
      }));
    }
}
