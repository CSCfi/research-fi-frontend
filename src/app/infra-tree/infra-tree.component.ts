import { Component, Input, OnInit, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Tree, TreeItem, TreeItemGroup } from '@angular/aria/tree';
import { ActivatedRoute, Router } from '@angular/router';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';
import { HandleInfrastructureLinkPipe } from '@portal/pipes/handle-infrastructure-link.pipe';
import { PopoverDirective } from 'ngx-bootstrap/popover';
import { cloneDeep } from 'lodash-es';

type TreeNode = {
  name: string;
  value: string;
  hasChildren?: boolean;
  hasParent?: boolean;
  children?: TreeNode[];
  disabled?: boolean;
  expanded?: boolean;
  isCurrent?: boolean;
  internationalInfraWeblink?: string;
};

@Component({
  selector: 'app-infra-tree',
  imports: [Tree, TreeItem, TreeItemGroup, NgTemplateOutlet, SvgSpritesComponent, HandleInfrastructureLinkPipe, PopoverDirective],
  templateUrl: './infra-tree.component.html',
  styleUrl: './infra-tree.component.scss'
})
export class InfraTreeComponent implements OnInit {
  inputReceived = false;
  kvInfraInfo = $localize`:@@kvInfraInfo:Kansainvälinen infrastruktuuri, jota ylläpidetään Suomen ulkopuolella. Sen toimintaan liittyy suomalaisten organisaatioiden ylläpitämiä infrastruktuureja. Ei tarkempia tietoja Tiedejatutkimus.fi:ssä.`;
  goToInfraPage = $localize`:@@goToInfraPage:Siirry infrastruktuurin sivulle`;

  @Input() infraId?: string;
  private _inputNodes: TreeNode[] = [];

  @Input()
  get inputNodes(): any {
    return this._inputNodes;
  }

  set inputNodes(nodes: any) {
    if (nodes) {
      this.nodes = [];
      // Trees can share node objects (the same subtree under several parents). Expanded state is written to the
      // node objects, so each tree needs its own copy to fold independently
      this.nodes.push(cloneDeep(nodes));
      this.inputReceived = true;
    }
  }

  @Input() hasPartArray?: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {

  }

  ngOnInit(): void {
  }

  // The tree toggles an item on any pointerdown inside it. Let only the caret reach the tree
  onItemPointerdown(event: PointerEvent) {
    if (!(event.target as HTMLElement).closest('.expand-icon')) {
      event.stopPropagation();
    }
  }

  navigateToInfraLink(infraId){
    if (infraId) {
    this.router.navigateByUrl('/results/infrastructure/' + infraId).then(() => {
      //window.location.reload();
      });
    }
  }

  nodes: TreeNode[] = [];

  selected = signal(['SubInfra2']);
}
