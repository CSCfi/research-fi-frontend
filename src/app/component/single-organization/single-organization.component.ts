import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SingleItemService } from '../../services/single-item.service';
import { SearchService } from '../../services/search.service';
import { Title } from '@angular/platform-browser';
import { map } from 'rxjs/operators';
import { faTwitter, faFacebook, faLinkedin, faMendeley } from '@fortawesome/free-brands-svg-icons';
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
    {label: 'Nimi (SV, EN)', field: 'nameSv', fieldEn: 'nameEn'},
    {label: 'Muut nimet', field: 'variantNames'},
    {label: 'Perustettu', field: 'established'},
    {label: 'Lisätietoa', field: 'organizationBackground'},
    {label: 'Edeltävä organisaatio', field: 'predecessors'},
    {label: 'Liittyvä organisaatio', field: 'related'},
    {label: 'Organisaatiomuoto', field: 'organizationType'},
    {label: 'Organisaation tyyppi', field: 'sectorNameFi'},
    {label: 'Käyntiosoite', field: 'visitingAddress'},
    {label: 'Postiosoite', field: 'postalAddress'},
    {label: 'Y-tunnus', field: 'businessId'},
    {label: 'Tilastokeskuksen oppilaitostunnus', field: '01910'},
    {label: 'Opetus- ja tutkimushenkilöstön määrä', field: 'staffCountAsFte'},
  ];

  studentCounts = [
    {label: 'Alempi korkeakoulututkinto', field: 'thesisCountBsc'},
    {label: 'Ylempi korkeakoulututkinto', field: 'thesisCountMsc'},
    {label: 'Lisensiaatintutkinto', field: 'thesisCountLic'},
    {label: 'Tohtorintutkinto', field: 'thesisCountPhd'}
  ];

  subUnitFields = [
    {label: 'Alayksiköt', field: 'subUnits'}
  ];

  faTwitter = faTwitter;
  faFacebook = faFacebook;
  faLinkedin = faLinkedin;
  faMendeley = faMendeley;

  errorMessage = [];
  @ViewChild('srHeader', { static: true }) srHeader: ElementRef;
  idSub: Subscription;
  expand: boolean;

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
      if (this.responseData[0].hits.hits[0]) {
        this.setTitle(this.responseData[0].hits.hits[0]._source.nameFi + ' - Tutkimusorganisaatiot - Haku - Tutkimustietovaranto');
        this.srHeader.nativeElement.innerHTML = this.titleService.getTitle().split(' - ', 1);
        this.shapeData();
        this.filterData();
      }
    },
      error => this.errorMessage = error as any);
  }

  filterData() {
    // Helper function to check if the field exists and has data
    const checkEmpty = (item: {field: string} ) =>  {
      return this.responseData[0].hits.hits[0]._source[item.field] !== undefined &&
             this.responseData[0].hits.hits[0]._source[item.field] !== 0 &&
             this.responseData[0].hits.hits[0]._source[item.field] !== null &&
             this.responseData[0].hits.hits[0]._source[item.field] !== ' ';
    };
    // Filter all the fields to only include properties with defined data
    this.infoFields = this.infoFields.filter(item => checkEmpty(item));
    this.studentCounts = this.studentCounts.filter(item => checkEmpty(item));
    this.subUnitFields = this.subUnitFields.filter(item => checkEmpty(item));
  }

  shapeData() {
    const source = this.responseData[0].hits.hits[0]._source;
    const predecessors = source.predecessors;
    const related = source.related;
    const subUnits = source.subUnits;

    if (predecessors && predecessors.length > 0) {
      source.predecessors = predecessors.map(x => x.nameFi.trim()).join(', ');
    }

    if (related && related.length > 0) {
      source.related = related.map(x => x.nameFi.trim()).join(', ');
    }

    if (subUnits && subUnits.length > 0) {
      source.subUnits = subUnits.map(x => x.subUnitName.trim()).join(', ');
    }

  }

  expandDescription() {
    this.expand = !this.expand;
  }
}
