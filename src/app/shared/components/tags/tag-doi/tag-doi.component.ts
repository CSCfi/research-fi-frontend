import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-tag-doi',
  templateUrl: './tag-doi.component.html',
  styleUrls: ['./tag-doi.component.scss'],
})
export class TagDoiComponent implements OnInit {
  @Input() link: string;

  constructor() {}

  ngOnInit(): void {}
}
