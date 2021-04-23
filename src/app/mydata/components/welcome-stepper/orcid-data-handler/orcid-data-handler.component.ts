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

@Component({
  selector: 'app-orcid-data-handler',
  templateUrl: './orcid-data-handler.component.html',
  styleUrls: ['./orcid-data-handler.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class OrcidDataHandlerComponent implements OnInit {
  success: boolean;
  checkAll: boolean;
  primarySource: string;
  allSelected: boolean;
  editedData: any;

  @Input() orcidData: any;

  faCheckCircle = faCheckCircle;

  dataSources = ['Orcid', 'Korkeakoulu A', 'Korkeakoulu B'];
  selectedSource = this.dataSources[0];

  openPanels: any = [];

  modalRef: BsModalRef;
  @ViewChild('editorModal') editorModal: ModalDirective;

  testData = [
    {
      label: 'Yhteystiedot',
      fields: [
        {
          label: 'Nimi',
          values: [{ value: 'Etunimi Sukunimi' }],
        },
        {
          label: 'Muut nimet',
          disabled: true,
          values: [
            { value: 'Etu Toinen Sukunimi', source: 'Orcid' },
            { value: 'E Sukunimi', source: 'Korkeakoulu A' },
          ],
        },
        { label: 'Sähköpostiosoite' },
        { label: 'Puhelinnumero' },
        { label: 'Linkit' },
      ],
      expanded: true,
    },
    { label: 'Tutkimustoiminnan kuvaus', fields: [] },
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

  profileData = [
    {
      label: 'Yhteystiedot',
      fields: [],
      expanded: true,
    },
    { label: 'Tutkimustoiminnan kuvaus', fields: [] },
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

  constructor(private modalService: BsModalService) {}

  ngOnInit(): void {
    this.primarySource = this.dataSources[0];

    console.log(this.orcidData.contactFields.fields);

    this.mapData();
  }

  mapData() {
    this.profileData[0].fields = this.orcidData.contactFields.fields;
  }

  setOpenPanel(i: number) {
    if (!this.openPanels.find((val) => val === i)) this.openPanels.push(i);
  }

  closePanel(i: number) {
    this.openPanels = this.openPanels.filter((val) => val !== i);
  }

  openModal(event, index, template: TemplateRef<any>) {
    event.stopPropagation();

    // this.selectedData = cloneDeep(this.profileData[index]);
    this.selectedData = this.profileData[index];

    this.allSelected = this.selectedData.fields.find((item) => item.show)
      ? true
      : false;
    this.modalRef = this.modalService.show(template);
    this.modalRef.setClass('modal-lg');
  }

  closeModal() {
    this.modalRef.hide();
  }

  toggleAll() {
    this.selectedData.fields.forEach((item) => (item.show = true));
    this.changeData(this.selectedData);
  }

  changeData(data) {
    this.allSelected = data.fields.find((item) => !item.show) ? false : true;
    this.editedData = data;
  }

  saveChanges(index) {
    if (this.editedData) this.profileData[index] = this.editedData;
    this.closeModal();
  }

  checkSelected = (item) => {
    return item.show;
  };

  checkEmpty = (item: { values: string | any[] }) => {
    return item.values?.length > 0;
  };
}
