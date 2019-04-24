import {Injectable} from '@angular/core';
import {Search} from '../models/search.model';
import {Observable} from 'rxjs/internal/Observable';
import {ResultsHttpService} from './results-http.service';

@Injectable({
  providedIn: 'root'
})
export class ResultsService {

  constructor(private resultsService: ResultsHttpService) { }

  getPublications(): Observable<Search[]> {
    return this.resultsService.getPublications();
  }
}
