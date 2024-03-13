import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatRippleModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-search-bar2',
  standalone: true,
  imports: [CommonModule, MatRippleModule, FormsModule],
  templateUrl: './search-bar2.component.html',
  styleUrls: ['./search-bar2.component.scss']
})
export class SearchBar2Component {
  route = inject(ActivatedRoute);
  router = inject(Router)

  // two-way "value" binding that's a string; basically text input
  @Input() value = "";
  @Output() valueChange = new EventEmitter<string>();

  // search is pressed output
  @Output() search = new EventEmitter<string>();

  // instruction button is pressed output
  @Output() instructions = new EventEmitter<void>();

  public keywords = this.route.snapshot.queryParams.q ?? "";
}
