import { Component, inject } from '@angular/core';
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

  /* Input/Output for keywords; Keep the keyword management in the parent? */
  /* Can be changed later easily */

  public keywords = this.route.snapshot.queryParams.q ?? "";

  searchKeywords(keywords: string) {
    this.router.navigate([], { queryParams: { q: keywords }, queryParamsHandling: 'merge' });
  }
}
