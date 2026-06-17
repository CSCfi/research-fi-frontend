import { afterRenderEffect, Component, DOCUMENT, Inject, Input, LOCALE_ID, OnInit, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Tree, TreeItem, TreeItemGroup } from '@angular/aria/tree';
import { ActivatedRoute, Router } from '@angular/router';

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
export class InfraTreeComponent implements OnInit {
  inputReceived = false;

  @Input() infraId?: string;
  private _inputNodes: TreeNode[] = [];

  @Input()
  get inputNodes(): TreeNode[] {
    return this._inputNodes;
  }

  set inputNodes(nodes: TreeNode[]) {
    if (nodes) {
      this.nodes = [];
      this.nodes = [...nodes];
      this.inputReceived = true;
    }
    console.log('inputNodes set to', nodes);
  }

  @Input() hasPartArray?: string;

  imaginaryDemoConnections = [
    {"id": "ttv-202512000769763", "name": "FIN-ENV-RI", "isPartOf": [], "hasPart": ["ttv-202601000812049", "ttv-202602000823839", "ttv-202603000873597"]},
    {"id": "research-infras-2016111643", "name": "ESO", "isPartOf": ["ttv-202512000769763"], "hasPart": []},
    {"id": "research-infras-2016072528", "name": "CTA (Suomi)", "isPartOf": ["ttv-202512000769763"], "hasPart": []},
    {"id": "ttv-202602000823839", "name": "OULU-CLIM-OBS", "isPartOf": ["ttv-202512000769763"], "hasPart": []},
    {"id": "ttv-202603000873597", "name": "OULU-CLIM-OBS2", "isPartOf": ["ttv-202512000769763"], "hasPart": ["ttv-202601000812049"]},
    {"id": "ttv-202601000812049", "name": "OULU-ENV-RI", "isPartOf": ["ttv-202512000769763"], "hasPart": ["ttv-202601000812030"]},
    {"id": "ttv-202601000812030", "name": "OULU-ARC-RI", "isPartOf": ["ttv-202601000812049"], "hasPart": ["ttv-202601000812058"]},
    {"id": "ttv-202601000812058", "name": "OULU-MAR-RI", "isPartOf": ["ttv-202601000812030"], "hasPart": []}
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {

  }

  getRootNodeAndChildren(id: string): TreeNode {
    let rootNode: TreeNode = {name: 'ROOT', value: 'ROOT', hasParent: false, children: []};
    let parentConnections = this.imaginaryDemoConnections.filter(connection => connection.hasPart.includes(id)).map(connection => connection);
    let parentNodes: TreeNode[] = [];
    parentConnections.forEach(connection => {rootNode.children.push({name: connection.name, value: connection.id, hasParent: true, children: []})});
    return rootNode;
  }

  getChildNodes(id: string): any[] {
    return this.imaginaryDemoConnections.filter(connection => connection.isPartOf.includes(id)).map(connection => connection);
  }


  ngOnInit(): void {
    this.build3LevelTestTree();
    //this.nodes = this.inputNodes;
  }

  navigateToInfraLink(infraId){
    console.log('infraId', infraId);
    if (infraId) {
    this.router.navigateByUrl('/results/infrastructure/' + infraId).then(() => {
      //window.location.reload();
      });
    }
  }

  build3LevelTestTree(){
    let rootNode = this.getRootNodeAndChildren(this.infraId);
      let currentNodeChildren = this.getChildNodes(this.infraId);
      let currentNode: TreeNode = {name: this.infraId, value: this.infraId, hasChildren: false, children: currentNodeChildren};

      // Set last children to be current node
      if (rootNode.children.length > 0) {
        let tempNode = rootNode.children[rootNode.children.length - 1];
        rootNode.children[rootNode.children.length - 1] = currentNode;
      } else {
        rootNode.children.push(currentNode);
      }
      let testNodes: TreeNode[] = [];
      testNodes.push(rootNode);
    }

  nodes: TreeNode[] = [
    {
      name: 'INAR RI',
      value: 'ID_INAR_RI',
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
          expanded: true,
          children: [
            {
              name: 'Lettosuo',
              value: 'ID_Lettosuo',
              hasChildren: true
            },
            {
              name: 'PALLAS',
              value: 'ID_PALLAS',
              hasChildren: true
            },
            {
              name: 'SMEAR',
              value: 'ID_SMEAR',
              expanded: true,
              children: [
                { name: 'SMEAR1', value: 'ID_SMEAR1', hasChildren: true},
                { name: 'SMEAR2', value: 'ID_SMEAR2', hasChildren: true},
                { name: 'SMEAR3', value: 'ID_SMEAR3', hasChildren: true},
                { name: 'SMEAR4', value: 'ID_SMEAR4', hasChildren: true},
              ],
            },
            {
              name: 'SODANKYLÄ',
              value: 'ID_SODANKYLÄ',
              hasChildren: true
            },
            {
              name: 'UTÖ',
              value: 'ID_UTÖ',
              hasChildren: true
            },
          ]
        },

      ],
      expanded: true
    }
  ];
  readonly selected = signal(['SubInfra2']);

}
