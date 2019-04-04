import { Injectable } from '@angular/core';
import { Post } from './post';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class DataService {

  searchOption = [];
  public usersData: Post[];
  userUrl = '/api/julkaisut/haku?julkaisuVuosi=2019&organisaatioTunnus=01901&&lehdenNimi=Nature';

  constructor(
    private http: HttpClient
  ) { }


  getUsers(): Observable<Post[]> {
    return this.http.get<Post[]>(this.userUrl);

  }

  filteredListOptions() {
    const users = this.usersData;
    const filteredUsersList = [];
    for (const user of users) {
            for (const options of this.searchOption) {
                if (options.julkaisunNimi === user.julkaisunNimi) {
                  filteredUsersList.push(user);
                }
            }
        }
    console.log(filteredUsersList);
    return filteredUsersList;
  }
}