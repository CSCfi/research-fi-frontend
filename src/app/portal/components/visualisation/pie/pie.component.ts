import { Component, Input, OnInit } from '@angular/core';
import { Visual } from '@portal/models/visualisation/visualisations.model';
import * as d3 from 'd3v4';

@Component({
  selector: 'app-pie',
  templateUrl: './pie.component.html',
  styleUrls: ['./pie.component.scss']
})
export class PieComponent implements OnInit {
  @Input() data: Visual;
  constructor() { }

  ngOnChanges(changes): void{
    if (changes.data)
    console.log(changes.data)
  }
  ngOnInit(): void {
    var data = [2, 4, 8, 10];

    var svg = d3.select("#chart"),
        width = 400,
        height = 400,
        radius = Math.min(width, height) / 2,
        g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var color = d3.scaleOrdinal(['#4daf4a','#377eb8','#ff7f00','#984ea3','#e41a1c']);

    // Generate the pie
    var pie = d3.pie();
   
    // Generate the arcs
    var arc = d3.arc()
                .innerRadius(0)
                .outerRadius(radius);

    //Generate groups
    var arcs = g.selectAll("arc")
                .data(pie(data))
                .enter()
                .append("g")
                .attr("class", "arc")

    //Draw arc paths
    arcs.append("path")
        .attr("fill", function(d, i) {
            return color(i);
        })
        .attr("d", arc);
  }

}
