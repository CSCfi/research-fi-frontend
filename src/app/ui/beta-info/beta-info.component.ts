import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-beta-info',
  templateUrl: './beta-info.component.html',
  styleUrls: ['./beta-info.component.scss']
})
export class BetaInfoComponent implements OnInit {

  constructor( private dialogRef: MatDialogRef<BetaInfoComponent> ) { }

  ngOnInit(): void {
  }

  close() {
    this.dialogRef.close();
  }

}
