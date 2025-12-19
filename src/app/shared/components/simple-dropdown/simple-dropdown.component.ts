import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass, NgForOf, NgIf } from '@angular/common';

@Component({
  selector: 'app-simple-dropdown',
  imports: [
    NgForOf,
    NgIf,
    NgClass
  ],
  templateUrl: './simple-dropdown.component.html',
  styleUrl: './simple-dropdown.component.scss'
})

export class SimpleDropdownComponent {
  @Input() options: string[];
  @Input() selection: number = 0;
  @Input() disabled: boolean;
  @Output() onSelected = new EventEmitter();

  menuOpen = false;
  protected readonly indexedDB = indexedDB;

  openMenu(){
    this.menuOpen = true;
  }

  select(selection: any){
    this.selection = selection;
    this.menuOpen = false;
    this.onSelected.emit(selection);
  }
}
