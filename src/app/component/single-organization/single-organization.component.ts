import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SingleItemService } from '../../services/single-item.service';
import { SearchService } from '../../services/search.service';
import { Title } from '@angular/platform-browser';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-single-organization',
  templateUrl: './single-organization.component.html',
  styleUrls: ['./single-organization.component.scss']
})
export class SingleOrganizationComponent implements OnInit, OnDestroy {
  public singleId: any;
  responseData: any [];
  searchTerm: string;
  pageNumber: any;
  tab = 'organizations';
  infoFields = [
    // {label: 'Organisaation nimi', field: 'nameFi'},
    {label: 'Perustettu', field: '?'},
    {label: 'Lisätietoa', field: '?'},
    {label: 'Organisaatiomuoto', field: '?'},
    {label: 'Sektori', field: 'sectorNameFi'},
    {label: 'Organisaation verkko-osoite', field: 'homepage'},
    {label: 'Osoite', field: '?'},
    {label: 'Y-tunnus', field: 'businessId'},
    {label: 'Tilastokeskuksen oppilaitostunnus', field: '?'},
    {label: 'Tunnuslukuja', field: '?'},
    {label: 'Alayksiköt', field: '?'}
  ];

  errorMessage = [];
  @ViewChild('srHeader', { static: true }) srHeader: ElementRef;
  idSub: Subscription;

  constructor( private route: ActivatedRoute, private singleService: SingleItemService, private searchService: SearchService,
               private titleService: Title ) {
   }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  ngOnInit() {
    this.idSub = this.singleService.currentId.subscribe(id => this.getData(id));
    this.singleId = this.route.snapshot.params.id;
    this.singleService.updateId(this.singleId);
    this.searchTerm = this.searchService.singleInput;
    this.pageNumber = this.searchService.pageNumber || 1;
  }

  ngOnDestroy() {
    this.idSub.unsubscribe();
  }

  getData(id: string) {
    this.singleService.getSingleOrganization(id)
    .pipe(map(responseData => [responseData]))
    .subscribe(responseData => {
      this.responseData = responseData;
      this.setTitle(this.responseData[0].hits.hits[0]._source.nameFi + ' - Tutkimusorganisaatiot - Haku - Tutkimustietovaranto');
      this.srHeader.nativeElement.innerHTML = document.title.split(' - ', 1);
      this.shapeData();
      this.filterData();
    },
      error => this.errorMessage = error as any);
  }

  filterData() {
    // Helper function to check if the field exists and has data
    const checkEmpty = (item: {field: string} ) =>  {
      return this.responseData[0].hits.hits[0]._source[item.field] !== undefined &&
             this.responseData[0].hits.hits[0]._source[item.field] !== ' ';
    };
    // Filter all the fields to only include properties with defined data
    this.infoFields = this.infoFields.filter(item => checkEmpty(item));
  }

  shapeData() {

  }
}
