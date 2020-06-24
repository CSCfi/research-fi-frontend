import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-primary-action-button',
  templateUrl: './primary-action-button.component.html',
  styleUrls: ['./primary-action-button.component.scss']
})
export class PrimaryActionButtonComponent implements OnInit {

  @Input() content: string;
  @Input() disabled: boolean;

  constructor() { }

  ngOnInit(): void {
  }

}
