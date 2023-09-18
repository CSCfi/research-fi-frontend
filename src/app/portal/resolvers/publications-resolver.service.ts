import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PublicationsResolver implements Resolve<boolean> {
  constructor(private http: HttpClient) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const page: number = route.queryParams.page || 1;
    const pageSize: number = route.queryParams.pageSize || 10;
    const q = route.queryParams.q || '';

    const from = (page - 1) * pageSize;

    console.log('Results from:', from, "with size:", pageSize, "using query", q || "<empty query>");

    if (q === "") {
      console.log("EMPTY QUERY");

      return this.http.post('https://researchfi-api-qa.rahtiapp.fi/portalapi/publication/_search?', {
        "from": from,
        "size": pageSize,
        "query": {
          "match_all": {}
        },
      });
    }

    /*
    return this.http.post('https://researchfi-api-qa.rahtiapp.fi/portalapi/publication/_search?', {
      "from": from,
      "size": pageSize,
      "query": {
        "multi_match": {
          "query": q,
          "fields": ["publicationName", "authorsText", "publisherName"]
        }
      },
      "highlight": {
        "fields": {
          "publicationName": {},
          "authorsText": {},
          "publisherName": {}
        },
        "pre_tags": ["<em class='highlight'>"],
        "post_tags": ["</em>"]
      } // */

    /*
    return this.http.post('https://researchfi-api-qa.rahtiapp.fi/portalapi/publication/_search?', {
      "from": from,
      "size": pageSize,
      "query": {
        "simple_query_string": {
          "query": q,
          "fields": ["publicationName", "authorsTextSplitted", "publisherName"], // TODO  "authorsText",
          "default_operator": "OR",
          "flags": "PHRASE"
        }
      },
      "highlight": {
        "fields": {
          "publicationName": {},
          "authorsText": {},
          "authorsTextSplitted": {},
          "publisherName": {}
        },
        "pre_tags": ["<em class='highlight'>"],
        "post_tags": ["</em>"]
      }
    }); // */

    // *
    return this.http.post('https://researchfi-api-qa.rahtiapp.fi/portalapi/publication/_search?', {
      "from": from,
      "size": pageSize,
      "query": {
        "query_string": {
          "query": q,
          "fields": ["publicationName", "authorsText", "publisherName"],
          "default_operator": "OR"
        }
      },
      "highlight": {
        "fields": {
          "publicationName": {},
          "authorsText": {},
          "authorsTextSplitted": {},
          "publisherName": {}
        },
        "pre_tags": ["<em class='highlight'>"],
        "post_tags": ["</em>"]
      }
    }); // */
  }
}
