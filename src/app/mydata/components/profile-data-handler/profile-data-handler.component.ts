//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import {
  BsModalRef,
  BsModalService,
  ModalDirective,
} from 'ngx-bootstrap/modal';
import { cloneDeep } from 'lodash-es';
import { ProfileService } from '@mydata/services/profile.service';
import { checkSelected, checkEmpty } from './utils';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EditorModalComponent } from './editor-modal/editor-modal.component';

import { FieldTypes } from '@mydata/constants/fieldTypes';

@Component({
  selector: 'app-profile-data-handler',
  templateUrl: './profile-data-handler.component.html',
  styleUrls: ['./profile-data-handler.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProfileDataHandlerComponent implements OnInit {
  testData: any;

  @Input() response: any;

  faCheckCircle = faCheckCircle;

  dataSources = [
    { label: 'ORCID' },
    { label: 'Korkeakoulu A', disabled: true },
    { label: 'Korkeakoulu B', disabled: true },
  ];

  selectedSource = this.dataSources[0];
  selectedIndex = 0;

  openPanels: any = [];

  modalRef: BsModalRef;
  @ViewChild('editorModal') editorModal: ModalDirective;

  checkSelected = checkSelected;
  checkEmpty = checkEmpty;

  // TODO: Localize
  profileData = [
    {
      label: 'Yhteystiedot',
      editLabel: 'yhteystietoja',
      fields: [],
    },
    {
      label: 'Tutkimustoiminnan kuvaus',
      editLabel: 'tutkimustoiminnan kuvausta',
      fields: [],
    },
    { label: 'Affiliaatiot', fields: [] },
    { label: 'Koulutus', fields: [] },
    { label: 'Julkaisut', fields: [] },
    { label: 'Tutkimusaineistot', fields: [] },
    { label: 'Hankkeet', fields: [] },
    { label: 'Muut hankkeet', fields: [] },
    { label: 'Tutkimusinfrastruktuurit', fields: [] },
    { label: 'Muut tutkimusaktiviteetit', fields: [] },
    { label: 'Meriitit', fields: [] },
  ];

  selectedData: any;

  fieldTypes = FieldTypes;

  dialogRef: MatDialogRef<EditorModalComponent>;

  constructor(
    private modalService: BsModalService,
    private profileService: ProfileService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {
    this.testData = profileService.testData;
  }

  ngOnInit(): void {
    this.mapData();
  }

  mapData() {
    // console.log(this.testData);
    this.profileData[0].fields = this.testData.personal;
    this.profileData[1].fields = this.testData.description;

    // console.log(JSON.stringify(this.response));
    // console.log('res: ', this.response.personal);
    // this.profileData[0].fields = this.response.personal;
    // this.profileData[1].fields = this.response.description;
  }

  setOpenPanel(i: number) {
    if (!this.openPanels.find((val) => val === i)) this.openPanels.push(i);
  }

  closePanel(i: number) {
    this.openPanels = this.openPanels.filter((val) => val !== i);
  }

  openDialog(event, index, editLabel) {
    event.stopPropagation();
    this.selectedIndex = index;
    this.selectedData = cloneDeep(this.profileData[index]);

    this.dialogRef = this.dialog.open(EditorModalComponent, {
      // maxWidth: '60vw',
      minWidth: '44vw',
      // maxHeight: '90vw',
      data: {
        data: cloneDeep(this.profileData[index]),
        dataSources: this.dataSources,
        editLabel: editLabel,
      },
    });
  }

  openModal(event, index, template: TemplateRef<any>) {
    event.stopPropagation();
    this.selectedIndex = index;
    this.selectedData = cloneDeep(this.profileData[index]);

    this.modalRef = this.modalService.show(template);
    this.modalRef.setClass('modal-lg');
  }

  closeModal() {
    this.modalRef.hide();
  }

  changeData(data) {
    if (data.data) {
      // console.log(this.profileData[this.selectedIndex]);
      this.profileData[this.selectedIndex] = data.data;

      this.profileService
        .patchProfileDataSingleGroup(data.patchItems)
        .subscribe((response) => {
          console.log(response);
          this.snackBar.open('Muutokset tallennettu');
        });
    }
  }
}
