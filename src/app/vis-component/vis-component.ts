import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ElementRef, Renderer2 } from '@angular/core';
import { Network } from 'vis-network/standalone';
import { TooltipContainerComponent } from 'ngx-bootstrap/tooltip';
import { Subscription } from 'rxjs';
import { toInteger } from 'lodash-es';

export interface visualizationData {
  nodeList: [];
  edges: [];
  rootId: string;
  selectedNodeId?: number;
}


@Component({
  selector: 'app-vis',
  templateUrl: './vis-component.html',
  imports: [
    TooltipContainerComponent
  ],
  styleUrls: ['./vis-component.scss']
})
export class VisComponent implements OnInit, OnDestroy {
  @ViewChild('viusalizationRef', { static: true }) networkContainer: ElementRef;
  @Input() infraId?: string;
  @Input() visualizationWidth?: number;
  @Input() visualizationHeight?: number;
  @Output() selectedNodeId = new EventEmitter<string>();

  private _nodeList: any[] = [];
  @Input() set nodeList(value: any[]) {
    this._nodeList = value;
  }

  get nodeList(): any[] {
    return this._nodeList;
  }

  private _edges: any[] = [];
  @Input() set edges(value: any[]) {
    this._edges = value;
  }

  get edges(): any[] {
    return this._edges;
  }

  private _visData: any;

  @Input() set visData(value: any) {
    if (value) {
      this._visData = value;
      this._edges = value.edges;
      this._nodeList = value.nodeList;
      this._rootId = value.rootId;
      this._selectedNodeId = value.selectedNodeId;

      let treeData = this.generateNetworkData();
      this.container = this.networkContainer.nativeElement;
      this.loadVisTree(treeData);
    }
  }

  get visData(): any {
    return this._visData;
  }

  _selectedNodeId = undefined;
  _rootId: string | undefined = 'default';


  @Input() set rootId(value: string | undefined) {
    if (this._rootId !== value) {
      this._rootId = value;
    }
  }

  get rootId(): string | undefined {
    return this._rootId;
  }

  public network: any;
  private resizeObserver: ResizeObserver;
  private container: HTMLElement;

  constructor() {
  }

  visTooltipText = '';
  visTooltipX: string = '0px';
  visTooltipY: string = '0px';
  showVisTooltip = false;

  getEdgeTooltip(edgeId: string): string {
    const edge = this.edges.find(e => e.id === edgeId);
    return `${this.findNodeLabelById(edge.from)} on osa infrastruktuuria ${this.findNodeLabelById(edge.to)}`;
  }

  findNodeLabelById(nodeId: string): any {
    const nodeLabel = this.nodeList.find(node => node.id === nodeId)?.label;
    return nodeLabel ?? 'tuntematon';
  }

  ngOnInit() {
    this.edges = this.edges.map(edge => {
      edge.color = '#4546B9';
      return edge;
    });


    let treeData = this.generateNetworkData();
    this.container = this.networkContainer.nativeElement;
    this.loadVisTree(treeData);
  }

  nodeClick(params: any) {
    console.log('node clicked', params);
    this.nodeList.filter(node => node.id === params.nodes[0]).map(node => {
      console.log('node found', node);
      this.selectedNodeId.emit(node.id);
    });
  }

  loadVisTree(treedata) {
    let options = {
      autoResize: true,
      interaction: {
        hover: true,
        navigationButtons: true
      },
      manipulation: {
        enabled: false
      },
      layout: {
        //hierarchical: { // Using this makes the nodes order in more horizontally lined style
        //  nodeSpacing: 40,
        //},
        randomSeed: 3 // Change this number to try different static layouts
      },
      nodes: {
        shape: 'dot',
        size: 30,
        font: {
          size: 20,
          color: '#000'
        },
        color: {
          background: 'white',
          border: '#4546B9',
          highlight: {
            background: '#4546B9',
            border: '#4546B9'
          }
        },
        borderWidth: 2
      },
      edges: {
        width: 3,
        arrows: {
          to: {
            enabled: true,
            scaleFactor: 1
          }
        }
      }
    };

    this.resizeObserver = new ResizeObserver(entries => {
      entries.forEach(entry => {
        const { width, height } = entry.contentRect;
        that.visTooltipX = (width + 10) / 2 + 'px';
        that.visTooltipY = height / 2 + 'px';
      });
    });
    this.resizeObserver.observe(this.container);

    this.container.addEventListener('mousemove', (event: MouseEvent) => {
      that.visTooltipX = event.clientX - 25 + 'px';
      that.visTooltipY = event.clientY - 80 + 'px';
    });

    this.network = new Network(this.container, treedata, options);
    this.network.canvas.body.container.style.cursor = 'drag';

    let that = this;
/*    this.network.on('hoverEdge', function(params) {
      that.showVisTooltip = true;
      that.network.canvas.body.container.style.cursor = 'default';
      const edgeTooltip = that.getEdgeTooltip(params.edge);
      const edgePosition = that.network.canvas.body.edges[params.edge]?.from;
      const xCoordinate = edgePosition?.x || 'N/A';
      const yCoordinate = edgePosition?.y || 'N/A';

      //that.visTooltipX = edgePosition?.x + that.vistTooltipOffsetX + 'px';
      //that.visTooltipY = edgePosition?.y + that.vistTooltipOffsetY + 'px';

      //that.network.canvas.body.container.title = edgeTooltip;
      that.visTooltipText = edgeTooltip;
    });*/

    this.network.on('blurEdge', function(params) {
      that.showVisTooltip = false;
      that.network.canvas.body.container.style.cursor = 'grab';
    });

    this.network.on('hoverNode', function(params) {
      const nodePosition = that.network.getPositions(params.node);
      let selNum = params.node;


      const firstChildKey = Object.keys(nodePosition)[0];
      //that.visTooltipX = nodePosition[firstChildKey].x + that.vistTooltipOffsetX + 'px';
      //that.visTooltipY = nodePosition[firstChildKey].y + that.vistTooltipOffsetY + 'px';


      that.network.canvas.body.container.style.cursor = 'pointer';
    });
    this.network.on('blurNode', function(params) {
      that.network.canvas.body.container.style.cursor = 'grab';
    });

    this.network.on('click', val => this.nodeClick(val));

    this.network.on('showPopup', function(params) {
    });
    if (this._selectedNodeId){
      this.network?.selectNodes([this._selectedNodeId]);
    }
  }

  setNodeProperties(nodeList: any[]) {
    console.log('setting node properties', nodeList, this._rootId);
    let params = {nodes: []};
    const ret = nodeList.map(node => {
      //console.log('setting node colors', nodeList, this._rootId);
      if (node.id === toInteger(this._rootId)) {
        params.nodes.push(toInteger(this._rootId));
        console.log('params', params);
        node.color = {
          border: '#068411',
          background: '#C5C5E5',
          highlight: {
            border: '#068411',
            background: '#4546B9',
            borderWidth: 2
          },
          hover: {
            background: '#C5C5E5',
            border: '#068411'
          }
        };
        //node.font = { size: 20, color: '#068411', borderWidth: 5 };
        node.borderWidth = 7;
      } else {
        node.color = {
          background: '#E8E8F5',
          border: '#4546B9',
          highlight: {
            border: '#4546B9',
            background: '#4546B9',
            borderWidth: 5
          },
          hover: {
            background: '#C5C5E5',
            border: '#4546B9'
          }
        };
        node.borderWidth = 2;
      }
      //node.border = '#5852A7';
      return node;
    });
    //this.nodeClick(params);
    return ret;
  }

  generateNetworkData() {
    // Color all nodes
    this.nodeList = this.setNodeProperties(this.nodeList);

    let treeData = {
      nodes: this.nodeList,
      edges: this.edges
    };
    return treeData;
  }

  ngOnDestroy() {
    this.resizeObserver.disconnect();
    this.container.removeEventListener('mousemove', (event: MouseEvent) => {
    });
  }

}