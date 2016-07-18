/**
 * Copyright (c) 2016Redsift Limited. All rights reserved.
*/
import { select } from 'd3-selection';
import * as d3TimeFormat from 'd3-time-format';
import { sum, extent, max, min } from 'd3-array';
import { nest} from 'd3-collection';
import { timeSunday, timeSundays, timeDays, timeWeek, timeDay} from 'd3-time';
import { scaleQuantize } from 'd3-scale';
import { html as svg } from '@redsift/d3-rs-svg';
import { 
  presentation10,
  display,
  fonts,
  widths,
  dashes
} from '@redsift/d3-rs-theme';

const DEFAULT_ASPECT = 160 / 420;
const EMPTY_COLOR = '#f2f2f2';


export default function chart(id) {

  let classed = 'calendar-chart',
      theme = 'light',
      background = undefined,
      dateFormat = d3TimeFormat.timeFormat('%Y-%m-%d'),
      dateIdFormat = d3TimeFormat.timeFormat('%Y%U'),
      weekId = (d,i) => d && d.length > 1 ? dateIdFormat(new Date(d[0].date)) : i,
      dayNum = d => new Date(d).getDay(),
      translate = (x,y) => ['translate(',x,y,')'].join(' '),
      colorScale = () => EMPTY_COLOR,
      squareY = (d,i) => i * (cellSize + cellSpacing),
      dI = d => d,
      dX = d => d.x,
      dY = d => d.y,
      dZ = d => d.z,
      xAxisText = dI,
      yAxisText = dI, 
      columnId = dY,
      yAxisData = [],
      xAxisData = [],
      margin = 26,
      width = 800,
      height = null,
      lastWeeks = 0,
      nextWeeks = 0,
      type = 'calendar',
      spaceToSizeRatio = 0.15,
      scale = 1.0,
      calendarColumn = 8,
      cellSize = width / ((lastWeeks+nextWeeks+2) * (1+spaceToSizeRatio)),
      cellSpacing = cellSize * spaceToSizeRatio,
      colour = 'green';

  let palette = (c) =>[
    presentation10.lighter[presentation10.names[c]],
    presentation10.standard[presentation10.names[c]],
    presentation10.darker[presentation10.names[c]]  
  ]

  function fullCalendar(lw, nw, dataByDate){
    var today = Date.now();

    var sunNumB = lw > 0 ? timeWeek.offset(today, -lw-1) : today;
    var sunNumE = nw > 0 ? timeWeek.offset(today, lw > 0 ? nw : nw+1) : today;
    var timeDaysPast = s => timeDays(
      Math.max(timeSunday.offset(today, -lw), s),
      Math.min(today, timeWeek.offset(s, 1)));
    var timeDaysFuture = s => timeDays(
      Math.max(timeDay.offset(today, -1), timeWeek.offset(s, -1)),
      Math.min(timeWeek.offset(today, nw), s));
    var timeDaysBoth = s => timeDays(
      Math.max(timeSunday.offset(timeDay.offset(today, -1), -lw), s),
      Math.min(timeSunday.offset(today, nw), timeWeek.offset(s, 1)));
    var timeSide = (lw > 0 && nw > 0) ? timeDaysBoth :
                    (lw > 0) ? timeDaysPast :
                      (nw > 0) ? timeDaysFuture :
                        timeDays(today,today);


    return timeSundays(sunNumB, sunNumE)
        .map(sunday =>
          timeSide(sunday).map(d => ({
              date: dateFormat(d),
              value: dataByDate.get(dateFormat(d)) || 0
            }))
      );
  }

  function heightCalc(overide){
    var suggestedHeight = calendarColumn * cellSize * (1+spaceToSizeRatio);
    // check for the stricter constraint
    if(height && suggestedHeight > height){
      cellSize = height / (calendarColumn * (1+spaceToSizeRatio));
      cellSpacing = cellSize * spaceToSizeRatio;
    }else{
      height = +overide || suggestedHeight;
    }
  }

  function dateValueCalc(data){
    var dataByDate = nest()
      .key(d => dateFormat(new Date(d.date)))
      .rollup(d => sum(d, g => +g.value))
      .map(data);

    colorScale = scaleQuantize()
        .domain(extent(dataByDate.entries(), d => d.value))
        .range(palette(colour));

    columnId = weekId;
    squareY = d => dayNum(d) * (cellSize + cellSpacing)
    dX = (d) => dateFormat(new Date(d.date))
    xAxisText = d => d3TimeFormat.timeFormat('%b')(new Date(d.date))
    yAxisText = d => d3TimeFormat.timeFormat('%a')(new Date(d))[0]

    let oneWeek = (starting) => timeDays(starting.offset(starting(Date.now()), -1), starting(Date.now()))
    yAxisData = oneWeek(timeSunday);

    data = fullCalendar(lastWeeks, nextWeeks, dataByDate);
    var monthNames = data
        .map((d,i) => ({order: i, date: d[0].date}))
        .filter((d,i) => i>0 && new Date(d.date).getDate() <= 7);
    xAxisData = monthNames;

    return data;
  }

  function xyzCalc(data){
    let matrix = [];
    // get unique x and y
    let set = new Set();
    data.forEach((v)=>{  
      set.add(v.x);
      set.add(v.y);
    })
    var a = Array.from(set).sort();
    var sum ={};
    a.map(y => { sum[y]={} });
    a.map(y => {
      a.map(x => {
        sum[y][x] = 0; 
        sum[x][y] = 0; 
        })
    });
    data.forEach((v) => { 
      sum[v.x][v.y] += v.z;
      if(v.x !== v.y){
        sum[v.y][v.x] += v.z;
      }
    });
    matrix = a.map(y => a.map(x => ({
        x: x,
        y: y,
        z: sum[x][y]
      }))
    );

    colorScale = scaleQuantize()
        .domain([
          min(matrix, d => min(d, dZ)),
          max(matrix, d => max(d, dZ))
          ])
        .range(palette(colour))
    yAxisData = a;
    xAxisData = a;

    return matrix;
  }

  function _impl(context) {
    if(lastWeeks === 0 && nextWeeks === 0){
      lastWeeks = 12;
    }
    let selection = context.selection ? context.selection() : context,
        transition = (context.selection !== undefined);

    let _background = background;
    if (_background === undefined) {
      _background = display[theme].background;
    }

    selection.each(function(data) {
      data = data || [];
      cellSize = width / ((lastWeeks+nextWeeks+2) * (1+spaceToSizeRatio)),
      cellSpacing = cellSize * spaceToSizeRatio;
      heightCalc();

      let node = select(this);  
      let sh = height || Math.round(width * DEFAULT_ASPECT);
      
      // SVG element
      let sid = null;
      if (id) sid = 'svg-' + id;
      let root = svg(sid).width(width).height(sh).margin(margin).scale(scale).background(_background);
      let tnode = node;
      if (transition === true) {
        tnode = node.transition(context);
      }
      tnode.call(root);
      
      let elmS = node.select(root.self());

      if(type === 'calendar'){
        data = dateValueCalc(data);
      }else{
        data = xyzCalc(data);
      }

      var column = elmS.selectAll('g').data(data, columnId);
      column.exit().remove();
      column = column.enter()
          .append('g')
          .attr('id', columnId)
        .merge(column);

      var square = column.selectAll('.square').data((d) => d)
      square.exit()
        .attr('width', 0)
        .attr('height', 0)
        .attr('y', (d,i) => squareY(d.date,i))
        .remove();
      square = square.enter()
          .append('rect')
            .attr('class', 'square')
            .attr('data-x', dX)
            .attr('data-z', dZ)
            .style('fill', EMPTY_COLOR)
          .merge(square);


      var yAxis = elmS.selectAll('.ylabels').data(yAxisData)
      yAxis.exit().remove();
      yAxis = yAxis.enter()
          .append('text')
          .attr('class','ylabels')
          .style('text-anchor', 'middle')
        .merge(yAxis)
          .attr('x', cellSize/2)
          .style('line-height', cellSize)
          .style('font-size', cellSize*0.6);


      var xAxis = elmS.selectAll('.xlabels').data(xAxisData,d => (d.date || d) )
      xAxis.exit().remove();
      xAxis = xAxis.enter()
        .append('text')
          .attr('class', 'xlabels')
          .text(xAxisText)
          .style('text-anchor', 'middle')
          .style('fill', '#000')
        .merge(xAxis)
          .style('line-height', cellSize)
          .style('font-size', cellSize*0.5);

    
      if (transition === true) {
        column = column.transition(context);
        square = square.transition(context);
        xAxis = xAxis.transition(context);
        yAxis = yAxis.transition(context);
      }

      column.attr('transform', (_,i) => translate( ++i * (cellSize + cellSpacing) , cellSize + 2*cellSpacing));
      square.attr('width', cellSize)
          .attr('height', cellSize)
          .attr('y', (d,i) => squareY(d.date,i))
          .style('fill', d => d.value || d.z ? colorScale(d.value || d.z) : EMPTY_COLOR);

      xAxis.attr('transform', (d,i) => translate( (d.order ? ++d.order : ++i) * (cellSize + cellSpacing), cellSize ))
        .attr('x', cellSize/2)
        .style('line-height', cellSize)
        .style('font-size', cellSize*0.5);

      yAxis.attr('transform', translate( 0 , 2*cellSize))
          .attr('y', squareY)
          .attr('x', cellSize/2)
          .style('line-height', cellSize)
          .style('font-size', cellSize*0.6)
          .text(yAxisText);

    });
  }
  _impl.self = function() { return 'g' + (id ?  '#' + id : '.' + classed); }

  _impl.id = function() { return id; };
  
  _impl.defaultStyle = () => `
                  ${fonts.variable.cssImport}
                  ${fonts.fixed.cssImport}  
                  ${_impl.self()} .axis line, 
                  ${_impl.self()} .axis path { 
                                              shape-rendering: crispEdges; 
                                              stroke-width: ${widths.axis}; 
                                              stroke: none;
                                            }
                  ${_impl.self()} g.axis-v line, 

                  ${_impl.self()} text { 
                                        font-family: ${fonts.variable.family};
                                        font-size: ${fonts.variable.sizeForWidth(width)};
                                        font-weight: ${fonts.variable.weightMonochrome}; 
                                        fill: ${display[theme].text}; 
                                      }
                   
                  ${_impl.self()} path.stroke { stroke-width: ${widths.data} }
                  
                  ${_impl.self()} g.axis-v line.grid,
                  ${_impl.self()} g.axis-i line.grid { 
                                             stroke-width: ${widths.grid}; 
                                             stroke-dasharray: ${dashes.grid};
                                             stroke: ${display[theme].grid};
                                            }
                  ${_impl.self()} g.axis-i g.tick line.grid.first,
                  ${_impl.self()} g.axis-v g.tick line.grid.first {
                                              stroke: none;
                                            }
                                            
                  ${_impl.self()} .axis text, 
                  ${_impl.self()} g.highlight text { 
                                   font-family: ${fonts.fixed.family} 
                                  }
                `;

  _impl.classed = function(_) {
    return arguments.length ? (classed = _, _impl) : classed;
  };

  _impl.background = function(_) {
    return arguments.length ? (background = _, _impl) : background;
  };

  _impl.theme = function(_) {
    return arguments.length ? (theme = _, _impl) : theme;
  }; 

  _impl.width = function(_) {
    return arguments.length ? (width = +_, _impl) : width;
  };

  _impl.height = function(_) {
    if(!arguments.length){
      return height;
    }
    heightCalc(_);

    return _impl
  };

  _impl.margin = function(_) {
    return arguments.length ? (margin = +_, _impl) : margin;
  };

  _impl.scale = function(_) {
    return arguments.length ? (scale = _, _impl) : scale;
  }; 

  _impl.lastWeeks = function(_) {
    return arguments.length ? (lastWeeks = +_, _impl) : lastWeeks;
  };

  _impl.nextWeeks = function(_) {
    return arguments.length ? (nextWeeks = +_, _impl) : nextWeeks;
  };

  _impl.colour = function(_) {
    return arguments.length ? (colour = +_, _impl) : colour;
  };

  _impl.type = function(_) { 
    return arguments.length ? (type = _, _impl) : type 
  };

  return _impl;
}
