//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs/Observable';

const API_URL = environment.apiUrl;

@Injectable()
export class AutosuggestService {
  apiUrl = API_URL;

  constructor(private http: HttpClient) { }

  search(terms: Observable<string>) {
    const payLoad = {
			query: {
				bool: {
					should: [
						{
							bool: {
								must: [
									{ term: { _index: 'publication'	}	},
									{	bool:
										{	should: [
											{ match_phrase_prefix: { publicationName: { query: terms } } }
										]	}
									}
								]
							}
						},
						{
							bool: {
								must: [
									{ term: { _index: 'funding'	}	},
									{	bool:
										{	should: [
											{ prefix: { projectNameFi: { value: terms } } }
										]	}
									}
								]
							}
						},
						{
							bool: {
								must: [
									{ term: { _index: 'person'	}	},
									{	bool:
										{	should: [
											{ prefix: { firstNames: { value: terms } } },
											{ prefix: { lastName: { value: terms } } }
										]	}
									}
								]
							}
						},
						{
							bool: {
								must: [
									{ term: { _index: 'organization'	}	},
									{	bool:
										{	should: [
											{ prefix: { nameFi: { value: terms } } }
										]	}
									}
								]
							}
						}
					],
					boost: 1
				}
			},
			aggs: {
					_index: {
							filters: {
									filters: {
											person: {
													match: {
															_index: 'person'
													}
											},
											publication: {
													match: {
															_index: 'publication'
													}
											},
											funding: {
													match: {
															_index: 'funding'
													}
											},
											organization: {
													match: {
															_index: 'organization'
													}
											}
									}
							},
							aggs: {
									index_results: {
											top_hits: {
													size: 3
											}
									}
							}
					}
			}
	};

	   return this.http.post(this.apiUrl + 'publication,person,funding,organization/_search?filter_path=aggregations&q=' + terms, payLoad);
	}

}
