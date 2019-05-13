import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SingleItemService } from '../../services/single-item.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-single',
  templateUrl: './single.component.html',
  styleUrls: ['./single.component.scss']
})
export class SingleComponent implements OnInit {
  public singleId: any;
  responseData: any [];
  errorMessage = [];

  constructor( private route: ActivatedRoute, private singleService: SingleItemService ) {
    this.singleId = this.route.snapshot.params.id;
    this.singleService.getId(this.singleId);
   }

  ngOnInit() {
    this.getData();
  }

  getData() {
    this.singleService.getSingle()
    .pipe(map(responseData => [responseData]))
    .subscribe(responseData => this.responseData = responseData,
      error => this.errorMessage = error as any);
  }

}
