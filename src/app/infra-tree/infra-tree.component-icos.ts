import { Component, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Tree, TreeItem, TreeItemGroup } from '@angular/aria/tree';

type TreeNode = {
  name: string;
  value: string;
  hasChildren?: boolean;
  hasParent?: boolean;
  children?: TreeNode[];
  disabled?: boolean;
  expanded?: boolean;
  isCurrent?: boolean;
};

@Component({
  selector: 'app-infra-tree',
  imports: [Tree, TreeItem, TreeItemGroup, NgTemplateOutlet],
  templateUrl: './infra-tree.component.html',
  styleUrl: './infra-tree.component.scss'
})
export class InfraTreeComponent {

  nodes: TreeNode[] = [
    {
      name: 'INAR RI',
      value: 'ID_INAR_RI',
      hasChildren: true,
      hasParent: true,
      children: [
        {
          name: 'ACTIRS-FI',
          value: 'ID_ACTIRS-FI',
          hasChildren: true
        },
        {
          name: 'ANAEE-FI',
          value: 'ID_ANAEE-FI',
          hasChildren: true
        },
        {
          name: 'eLTER-FI',
          value: 'ID_eLTER-FI',
          hasChildren: true
        },
        {
          name: 'ICOS Suomi',
          value: 'ID_ICOS_Suomi',
          isCurrent: true,
          children: [
            {
              name: 'Lettosuo',
              value: 'ID_Lettosuo',
              hasChildren: false
            },
            {
              name: 'PALLAS',
              value: 'ID_PALLAS',
              hasChildren: false
            },
            {
              name: 'SMEAR',
              value: 'ID_SMEAR',
              children: [
                { name: 'SMEAR1', value: 'ID_SMEAR1'},
                { name: 'SMEAR2', value: 'ID_SMEAR2'},
                { name: 'SMEAR3', value: 'ID_SMEAR3'},
                { name: 'SMEAR4', value: 'ID_SMEAR4'},
              ],
            },
            {
              name: 'SODANKYLÄ',
              value: 'ID_SODANKYLÄ',
              hasChildren: false
            },
            {
              name: 'UTÖ',
              value: 'ID_UTÖ',
              hasChildren: false
            },
          ]
        },

      ],
      expanded: false
    }
  ];
  readonly selected = signal(['SubInfra2']);
}
