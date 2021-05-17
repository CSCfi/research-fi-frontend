import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-editor-modal',
  templateUrl: './editor-modal.component.html',
  styleUrls: ['./editor-modal.component.scss'],
})
export class EditorModalComponent implements OnInit {
  @Input() data: any;
  @Input() dataSources: any;

  allSelected: boolean;

  selectedSource: string;

  @Output() emitClose = new EventEmitter<boolean>();
  @Output() dataChange = new EventEmitter<object>();

  editedData: any;

  constructor() {}

  ngOnInit(): void {
    this.selectedSource = this.dataSources[0];

    this.allSelected = !!this.data.fields.find((item) => item.show === false)
      ? false
      : true;
  }

  closeModal() {
    this.emitClose.emit(true);
  }

  checkSelected = (item) => {
    return item.show;
  };

  changeData(data) {
    this.allSelected = !!data.fields.find((item) => item.show === false)
      ? false
      : true;

    this.editedData = data;
  }

  toggleAll() {
    this.data.fields.forEach((item) => (item.show = true));
    this.changeData(this.data);
  }

  saveChanges() {
    this.dataChange.emit(this.editedData);
    this.closeModal();
  }
}
