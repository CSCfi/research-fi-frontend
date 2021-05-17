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
  testData: any;

  @Input() response: any;

  faCheckCircle = faCheckCircle;

  dataSources = ['Orcid', 'Korkeakoulu A', 'Korkeakoulu B'];
  selectedSource = this.dataSources[0];
  selectedIndex = 0;

  openPanels: any = [];

  modalRef: BsModalRef;
  @ViewChild('editorModal') editorModal: ModalDirective;

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

  constructor(
    private modalService: BsModalService,
    private profileService: ProfileService
  ) {
    this.testData = profileService.testData;
  }

  ngOnInit(): void {
    this.primarySource = this.dataSources[0];
    this.mapData();
  }

  mapData() {
    // console.log(this.testData);
    // this.profileData[0].fields = this.testData;
    console.log(this.response.personal);
    this.profileData[0].fields = this.response.personal;
  }

  setOpenPanel(i: number) {
    if (!this.openPanels.find((val) => val === i)) this.openPanels.push(i);
  }

  closePanel(i: number) {
    this.openPanels = this.openPanels.filter((val) => val !== i);
  }

  openModal(event, index, template: TemplateRef<any>) {
    event.stopPropagation();
    this.selectedData = cloneDeep(this.profileData[index]);

    this.modalRef = this.modalService.show(template);
    this.modalRef.setClass('modal-lg');
  }

  closeModal(event) {
    this.modalRef.hide();
  }

  changeData(data) {
    if (data) {
      this.profileData[this.selectedIndex] = data;

      // TODO: Map payload by new API schema
      // TODO: Patch only with data that has changed
      console.log(data.fields.map((item) => item.items[0].itemMeta));

      const payload = data.fields
        .map((item) => {
          if (item.items) {
            return item.items.map((x) => {
              return { id: x.id, show: x.show };
            });
          } else {
            return { id: item.id, show: item.show };
          }
        })
        .flat(1);
      this.profileService
        .patchProfileData(payload)
        .subscribe((response) => console.log(response));
    }
  }

  checkSelected = (item) => {
    return item.groupMeta.show;
  };

  checkEmpty = (item: { values: string | any[] }) => {
    return item.values?.length > 0;
  };
}
