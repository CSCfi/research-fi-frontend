import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { NgForOf, NgIf } from '@angular/common';
import { ClickOutsideDirective } from '@shared/directives/click-outside.directive';
import { CapitalizeFirstLetterPipe } from '@shared/pipes/capitalize-first-letter.pipe';

@Component({
  selector: 'app-sort-dropdown-menu',
  standalone: true,
  imports: [
    ClickOutsideDirective,
    FormsModule,
    MatRadioButton,
    MatRadioGroup,
    NgForOf,
    NgIf,
    CapitalizeFirstLetterPipe
  ],
  templateUrl: './sort-dropdown-menu.component.html',
  styleUrl: './sort-dropdown-menu.component.scss'
})
export class SortDropdownMenuComponent implements OnChanges {
  @Input() showMenuTrigger= false;
  @Input() selection: number;
  @Output() valueChange = new EventEmitter<any>();

  showMenu = true;

ngOnChanges(changes: SimpleChanges) {
  if (changes?.showMenuTrigger){
    this.toggleMenu();
  }
  this.setSelection(this.selection);
}

  byYearText = $localize`:@@sortByYear:vuoden mukaan`;
  byOpennessText = $localize`:@@sortByOpenness:avoimen saatavuuden mukaan`;

  targets = [this.capitalizeFirstLetter(this.byOpennessText), this.capitalizeFirstLetter(this.byYearText)];

  selections = [false, true];

  capitalizeFirstLetter(value) {
    return value[0].toUpperCase() + value.slice(1);
  }
  setSelection(target: number){
    for (let i = 0; i < this.selections.length; i++) {
      i === target ? this.selections[i] = true : this.selections[i] = false;
    }
  }

  toggleMenu(){
    this.showMenu = !this.showMenu;
  }

  onClickedOutside(event) {
    this.showMenu = false;
  }

  changeSelection(sel: number){
    this.valueChange.emit(sel);
    this.toggleMenu();
  }
}
