import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { FilterOptionComponent } from '@portal/components/filter-option/filter-option.component';
import { NgArrayPipesModule } from 'ngx-pipes';
import { FormsModule } from '@angular/forms';
import { LimitPipe } from '@portal/pipes/limit.pipe';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { CollapsibleComponent } from '@portal/components/collapsible/collapsible.component';

@Component({
  selector: 'app-organization-filter',
  templateUrl: './organization-filter.component.html',
  styleUrls: ['./organization-filter.component.scss'],
  imports: [
    NgIf,
    AsyncPipe,
    FilterOptionComponent,
    LimitPipe,
    NgArrayPipesModule,
    NgForOf,
    FormsModule,
    CdkAccordionModule,
    CollapsibleComponent
  ],
  standalone: true
})
export class OrganizationFilterComponent {
  @Input() filterData: unknown;
  @Output() selected = new EventEmitter<string>();

  selectedSector = -1;

  expanded = false;
  sectorFilter: Record<number, string> = {};

  sectorLimits: Record<number, number> = {
    1: 10,
    2: 10,
    3: 10,
    4: 10,
    6: 10,
  };

  public sectorNames = {
    1: "Yliopisto",
    2: "Ammattikorkeakoulu",
    3: "Tutkimuslaitos",
    4: "Yliopistollisen sairaalan erityisvastuualue",
    6: "Muu"
  }

  toggleExpanded() {
    this.expanded = !this.expanded;
  }
}
