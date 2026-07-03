import {
  Component, ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output, QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-simple-dropdown',
  imports: [
    NgClass
  ],
  templateUrl: './simple-dropdown.component.html',
  styleUrl: './simple-dropdown.component.scss'
})

export class SimpleDropdownComponent {

  randomComponentClass = '';

  @ViewChild('element') element: ElementRef;
  @ViewChildren('elementChild') elementChild: QueryList<any>;

  @Input() options: string[];
  @Input() selection: number = 0;
  @Input() activeInOpenMenu: number = 0;
  @Input() disabled: boolean;
  @Output() onSelected = new EventEmitter();
  @ViewChild('selectButtonRef', { static: true }) selectButtonRef: ElementRef;
  @ViewChild('ulRef', { static: true }) ulRef: ElementRef;

  constructor() {
    this.randomComponentClass = 'simple-dropdown-element-' + this.getRandomInt(10000000);
  }

  menuOpen = false;

  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  @HostListener('document:click', ['$event'])
  mouseFunc(event) {
    // Close menu on click outside menu
    if (!event.target.classList.value.includes(this.randomComponentClass)) {
      this.menuOpen = false;
    }
  }

  @HostListener('document:keyup', ['$event'])
  keyFunc(event) {
    event.stopPropagation();
    if (event.code === 'Tab') {
      this.menuOpen = false;
    }
    if (event.code === 'Escape') {
      this.menuOpen = false;
    }
    if (event.code === 'Enter') {

      if (!this.menuOpen) {
        this.menuOpen = true;
      } else {
        this.selection = this.activeInOpenMenu;
        this.menuOpen = false;
      }
    }
    if (event.code === 'ArrowUp') {
      if (this.activeInOpenMenu > 0) {
        this.activeInOpenMenu -= 1;
      }
    } else if (event.code === 'ArrowDown') {
      if (this.activeInOpenMenu < this.options.length - 1) {
        this.activeInOpenMenu += 1;
      }
    }
  }

  openMenu() {
    this.menuOpen = true;
  }

  select(selection: any) {
    this.selection = selection;
    this.activeInOpenMenu = selection;
    this.menuOpen = false;
    this.onSelected.emit(selection);
  }
}