import { Component, OnInit } from '@angular/core';
import {  Utilities, DataService } from 'src/app/common-utils.service';


declare var d3: any;
declare var $: any;
@Component({
  selector: 'app-interaction-summary',
  templateUrl: './interaction-summary.component.html',
  styleUrls: ['./interaction-summary.component.css']
})
export class InteractionSummaryComponent implements OnInit {

  constructor(private data: DataService) {
  }

  ngOnInit(): void {
    this.data.currentIntSummMessage.subscribe(message => this.onNewTagEntry(message));
  }

  onNewTagEntry(message): void{
    $('#interaction_summary').html('');
    this.renderSummary(message);
  }

  renderSummary(rows): void{
    if (rows.length == 0) {
      return;
    }

    const totalInitiated = [];
    const totalReceivedTmp = {};
    const totalReceived = [];


    const axisFontSize = 12;
    const labelFontSize = 10;
    // debugger;
    const divW = 840;
    const divH = 750;
    // Graph dimension
    const margin = {top: 80, right: 120, bottom: 80, left: 120},
      width = divW - margin.left - margin.right,
      height = divH - margin.top - margin.bottom;


    // Create the svg area
    const svg = d3.select('#interaction_summary')
      .append('svg')
      .style('border','1px solid grey')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


    // var rows = [];
    // rows.push({"": "Bernie", Bernie: "-1", Biden: "2", Kamala: "4", Cory: "5", booker:"10"});
    // rows.push({"": "Biden", Bernie: "15", Biden: "-1", Kamala: "15", Cory: "6",booker:"10"});
    // rows.push({"": "Kamala", Bernie: "0", Biden: "1", Kamala: "-1", Cory: "10",booker:"10"});
    // rows.push({"": "Cory", Bernie: "10", Biden: "2", Kamala: "3", Cory: "18",booker:"10"});
    // rows.push({"": "booker", Bernie: "24", Biden: "3", Kamala: "5", Cory: "6",booker:"10"});

    // d3.csv("./basicCorrData.csv", function(error, rows) {

      // Going from wide to long format
    const data = [];
    let max = 0, min = 10000;
    rows.forEach(function(d) {
        const x = d['d'];
        delete d['d'];
        let initiated = 0;
        const tempI = {};

        for (const prop in d) {
          const y = prop,
            value = d[prop];
          initiated += +value == -1 ? 0 : +value;

          if (!totalReceivedTmp.hasOwnProperty(prop)){
            totalReceivedTmp[prop] = 0;
          }
          totalReceivedTmp[prop] += +value == -1 ? 0 : +value;
          data.push({
            x: y,
            y: x,
            value: +value
          });
        }

        max = Math.max(max, initiated);
        min = Math.min(min, initiated);
        tempI['x'] = x;
        tempI['value'] = initiated;
        totalInitiated.push(tempI);
      });

    for (const prop in totalReceivedTmp){
        const tempR = {};
        tempR['x'] = prop;
        tempR['value'] = totalReceivedTmp[prop];
        max = Math.max(max, totalReceivedTmp[prop]);
        min = Math.min(min, totalReceivedTmp[prop]);
        totalReceived.push(tempR);
      }
    const tempR = {x: '', value: 0};
    totalInitiated.push(tempR);
    totalReceived.push(tempR);




    const circleScale = 2 / max;
      // List of all variables and number of them
    const domain = d3.set(data.map(function(d) { return d.x; })).values();
    domain.push('');
    const num = Math.sqrt(data.length);


      // Create a color scale
    const color = d3.scaleLinear().domain([0, max])
        .range(['white', 'blue']);

      // Create a size scale for bubbles on top right. Watch out: must be a rootscale!
    const size = d3.scaleSqrt()
        .domain([0, 1])
        .range([0, 9]);

      // X scale
    const x = d3.scalePoint()
        .range([0, width])
        .domain(domain);

      // Y scale
    const y = d3.scalePoint()
        .range([0, height])
        .domain(domain);


    const xLinePad = (x(domain[1]) - x(domain[0])) / 2;
    const yLinePad = (y(domain[1]) - y(domain[0])) / 2;

    const xAxis = svg.append('text')
        .text('<---- Actor')
        .style('font-size', axisFontSize)
        .style('text-align', 'center')
        .style('fill', 'black')
        .attr('transform', function(d) {
          // @ts-ignore
          // return 'translate( ' + parseInt(x(domain[0]) -  (xLinePad * 1.25))  + ', ' + 75 + ') rotate(270)';
          return 'translate( -90, ' + 220  + ') rotate(270)';
        });

    const yAxis = svg.append('text')
        .text('Recipient ---->')
        .style('font-size', axisFontSize)
        .style('text-align', 'center')
        .style('fill', 'black')
        .attr('transform', function(d) {
          // @ts-ignore
          // return "translate( " + parseInt(x(domain[parseInt(num/2)-1]) + xLinePad) + ",-50)"
          return 'translate( ' + width/2.5+',-55)';
        });


    const xAxisLabels = svg
      .selectAll('.x-labels')
      .data(domain)
      .enter()
      .append('text')
      .style('fill', 'grey')
      .attr('class', 'x-labels')
      .attr('y', function(d){
        return y(d);
      })
      .attr('x', -(xLinePad * 2.6))
      .text(function(d){
        return d;
      })
      .style('font-size', labelFontSize)
      .style('text-align', 'center');


    const yAxisLabels = svg
      .selectAll('.y-labels')
      .data(domain)
      .enter()
      .append('text')
      .style('fill', 'grey')
      .attr('class', 'y-labels')
      .attr('y', function(d){
        return  -  (yLinePad) * 1.5;
      })
      .attr('x', function(d){
        return x(d) - xLinePad / 2;
      })
      .text(function(d){
        return d;
      })
      .style('font-size', labelFontSize)
      .style('text-align', 'center');

    const initiatedLabel = svg.append('text')
        .text('Total Initiated ---->')
        .style('font-size', axisFontSize)
        .style('text-align', 'center')
        .style('fill', 'black')
        .attr('transform', function(d) {
          return 'translate( ' + (x('') + xLinePad / 2)  + ', -30) rotate(90)';
        });


    const receivedLabel = svg.append('text')
        .text('Total Received ---->')
        .style('font-size', axisFontSize)
        .style('text-align', 'center')
        .style('fill', 'black')
        .attr('transform', function(d) {
          // @ts-ignore
          // return "translate( " + parseInt(x(domain[parseInt(num/2) - 1])) + "," +  parseInt(height + 2*yLinePad) + ")"
          return 'translate( -40,' +  parseInt(height + 2 * yLinePad) + ')';
        });




      // Border main cells
    const verticalBorder = svg.selectAll('.borderx')
        .data(domain)
        .enter()
        .append('line')
        .attr('class', 'borderx')
        .style('stroke-width', 1)
        .style('stroke', 'black')
        .attr('x1', function(d){
          return x(d) -  xLinePad;
        })
        .attr('y1', function(d){
          return -margin.top / 3;
        })
        .attr('x2', function(d){
          return x(d) - xLinePad;
        })
        .attr('y2', function(d){
          return height - margin.bottom / 3;
        });


    const horizontalBorder = svg.selectAll('.bordery')
        .data(domain)
        .enter()
        .append('line')
        .attr('class', 'bordery')
        .style('stroke-width', 1)
        .style('stroke', 'black')
        .attr('x1', function(d){
          return -xLinePad;
        })
        .attr('y1', function(d){
          return y(d) - margin.top / 3;
        })
        .attr('x2', function(d){
          return width - xLinePad;
        })
        .attr('y2', function(d){
          return y(d) - margin.top / 3;
        });

      // Border Received
    const verticalBorderRec = svg.selectAll('.borderxR')
        .data(domain)
        .enter()
        .append('line')
        .attr('class', 'borderxR')
        .style('stroke-width', 1)
        .style('stroke', 'black')
        .attr('x1', function(d){
          return x(d) -  xLinePad;
        })
        .attr('y1', function(d){
          return height - yLinePad / 2;
        })
        .attr('x2', function(d){
          return x(d) - xLinePad;
        })
        .attr('y2', function(d){
          return height + yLinePad;
        });

    const domainRec = domain.slice(2);
      // let horizontalBorderRec = svg.selectAll(".borderyR")
      //   .data(domainRec)
      //   .enter()
      //   .append("line")
      //     .attr("class", "borderyR")
      //     .style("stroke-width", 1)
      //     .style("stroke", "black")
      //     .attr("x1", function(d){
      //       return -xLinePad;
      //     })
      //     .attr("y1", function(d){
      //       return y(d) + yLinePad;
      //     })
      //     .attr("x2", function(d){
      //       return width - xLinePad;
      //     })
      //     .attr("y2", function(d){
      //       return y(d) + yLinePad;
      //     });

      // Border Initiated
    const horizontalBorderIn = svg.selectAll('.borderxI')
        .data(domain)
        .enter()
        .append('line')
        .attr('class', 'borderxI')
        .style('stroke-width', 1)
        .style('stroke', 'black')
        .attr('x1', function(d){
          return x('') - xLinePad / 2;
        })
        .attr('y1', function(d){
          return y(d) - yLinePad;
        })
        .attr('x2', function(d){
          return x('') + xLinePad / 3;
        })
        .attr('y2', function(d){
          return y(d) - yLinePad;
        });

      // let verticalBorderIn = svg.selectAll(".borderyI")
      //   .data(domainRec)
      //   .enter()
      //   .append("line")
      //     .attr("class", "borderyI")
      //     .style("stroke-width", 1)
      //     .style("stroke", "black")
      //     .attr("x1", function(d){
      //       return x(domainRec[0]) + x(d)/2.6;
      //     })
      //     .attr("y1", function(d){
      //       return -yLinePad;
      //     })
      //     .attr("x2", function(d){
      //       return x(domainRec[0]) + x(d)/2.6;
      //     })
      //     .attr("y2", function(d){
      //       return height - yLinePad;
      //     });



      // Create one 'g' element for each cell of the correlogram
    const cor = svg.selectAll('.cor')
        .data(data)
        .enter()
        .append('g')
        .attr('class', 'cor')
        .attr('transform', function(d) {
          return 'translate(' + x(d.x) + ',' + y(d.y) + ')';
        });

    const cirInitiated = svg.selectAll('.cor1')
        .data(totalInitiated)
        .enter()
        .append('g')
        .attr('class', 'cor1')
        .attr('transform', function(d) {
          return 'translate(' + x('') + ',' + y(d.x) + ')';
        });

    const cirReceived = svg.selectAll('.cor2')
        .data(totalReceived)
        .enter()
        .append('g')
        .attr('class', 'cor2')
        .attr('transform', function(d) {
          return 'translate(' + x(d.x) + ',' + y('') + ')';
        });

      // Low left part + Diagonal: Add the text with specific color
      // cor
      //   .filter(function(d){
      //     let ypos = domain.indexOf(d.y);
      //     let xpos = domain.indexOf(d.x);
      //     return xpos <= ypos;
      //   })
      //   .append("text")
      //   .attr("y", 5)
      //   .attr("x", 0)
      //
      //   .text(function(d) {
      //     if (d.x === d.y) {
      //       return d.x;
      //     }
      //     // else {
      //     //   return d.value.toFixed(2);
      //     // }
      //   })
      //   .style("font-size", 16)
      //   .style("font-weight", "bold")
      //   .style("fill", function(d){
      //     if (d.x === d.y) {
      //       return "#000";
      //     } else {
      //       return color(d.value);
      //     }
      //   });


      // Up right part: add circles
    cor
        .filter(function(d){
          const ypos = domain.indexOf(d.y);
          const xpos = domain.indexOf(d.x);
          return xpos != ypos;
        })
        //  .append("text")
        //  .text(function(d){
        //    return d.value;
        //  })
        //   // .attr("r", function(d){ return size(Math.abs(d.value)/3) })
        //   .style("fill", function(d){
        //     if (d.x === d.y) {
        //       return "#000";
        //     } else {
        //       return color(d.value);
        //     }
        //   })
        //   .style("opacity", 0.8);
        .append('circle')
        .attr('r', function(d){ return size(Math.abs(d.value) * circleScale); })
        .style('fill', function(d){
          if (d.x === d.y) {
            return '#000';
          } else {
            return color(d.value);
          }
        })
        .style('opacity', 0.8);


      // Initiated
    cirInitiated
        .filter(function(d){
          return d.x != '';
        })
        .append('circle')
        .attr('r', function(d){ return size(Math.abs(d.value) * circleScale); })
        .style('fill', function(d){
          return color(d.value);
        })
        .style('opacity', 0.8);


      // Received
    cirReceived
        .filter(function(d){
          return d.x != '';
        })
        .append('circle')
        .attr('r', function(d){ return size(Math.abs(d.value) * circleScale); })
        .style('fill', function(d){
          return color(d.value);
        })
        .style('opacity', 0.8);

    // })

    const chartName = svg.append('text')
      .text('INTERACTION SUMMARY')
      .style('font-size', '12px')
      .style('background-color','black')
      .style('text-align', 'center')
      .style('fill', 'grey')
      .attr('transform', function(d) {
        // @ts-ignore
        // return "translate( " + parseInt(x(domain[parseInt(num/2)-1]) + xLinePad) + ",-50)"
        return 'translate( -110,-60)';
      });
  }

}
