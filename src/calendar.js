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
const DEFAULT_AXIS_PADDING = 8;
const EMPTY_COLOR = '#f2f2f2';


export default function chart(id) {

  let classed = 'square-chart',
      theme = 'light',
      background = undefined,
      style = undefined,
      starting = timeSunday,
      dateFormat = d3TimeFormat.timeFormat('%Y-%m-%d'),
      dateIdFormat = d3TimeFormat.timeFormat('%Y%U'),
      D = d => new Date(d),
      dayNum = d => D(d).getDay(),
      translate = (x,y) => `translate(${x},${y})`,
      colorScale = () => EMPTY_COLOR,
      squareY = (_,i) => i * cellSize,
      dI = d => d,
      dX = d => d.x,
      dY = d => d.y,
      dZ = d => d.z,
      xAxisText = dI,
      yAxisText = dI, 
      columnId = dI,
      yAxisData = [],
      xAxisData = [],
      margin = 26,
      width = 800,
      height = null,
      lastWeeks = 0,
      nextWeeks = 0,
      type = null,
      scale = 1.0,
      calendarColumn = 8,
      cellSize = (width - margin) / (lastWeeks+nextWeeks+2),
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

    var result = [];
    timeSundays(sunNumB, sunNumE)
        .map(sunday =>{
          let temp = [];
          let m1 = false;
          timeSide(sunday).map(d => {
              if(D(d).getDate() === 1 && temp.length > 0){
                m1 = true;
                result.push(temp.slice(0));
                temp = [];
              }
              temp.push({ 
                x: dateFormat(d),
                z: dataByDate.get(dateFormat(d)) || 0
              });
            })
          result.push(temp);
        }
      );
    return result;
  }

  function heightCalc(overide){
    var suggestedHeight = calendarColumn * cellSize;
    // check for the stricter constraint
    if(height && suggestedHeight > (height-margin)){
      cellSize = (height - margin) / calendarColumn;
    }else{
      height = +overide || suggestedHeight;
    }
  }

  function dateValueCalc(data){
    data = data || [];
    lastWeeks = lastWeeks === 0 && nextWeeks === 0 ? 12 : lastWeeks;
    let retroDate = d => (d.date || d.x);
    let retroValue = d => (+d.value || +d.z);
    const checkStarting = dayNum(starting(Date.now()));
    let dataByDate = nest()
      .key(d => dateFormat(D(retroDate(d))))
      .rollup(d => sum(d, retroValue))
      .map(data);

    colorScale = scaleQuantize()
        .domain(extent(dataByDate.entries(), retroValue))
        .range(palette(colour));

    columnId = (d,i) => d && d.length > 1 ? dateIdFormat(D(retroDate(d[0]))) : i;
    // used for squares and yAxis
    squareY = d => {
      const v = d.x || d;
      let e = 0;
      if(dayNum(v) < checkStarting) {
        e = 6 - dayNum(v)
      }else{
        e = dayNum(v) - checkStarting
      }
      return e * cellSize

    }
    dX = (d) => dateFormat(D(retroDate(d)))
    xAxisText = d => d3TimeFormat.timeFormat('%b')(D(retroDate(d)))
    yAxisText = d => d3TimeFormat.timeFormat('%a')(D(d))[0]

    yAxisData = timeDays(starting.offset(starting(Date.now()), -1), starting(Date.now()))

    data = fullCalendar(lastWeeks, nextWeeks, dataByDate);
    var monthNames = data
        .map((d,i) => ({order: i, date: retroDate(d[0])}))
        .filter((d,i) => i>0 && D(d.date).getDate() <= 7 && dayNum(retroDate(d)) === checkStarting );
    xAxisData = monthNames;

    cellSize = (width - margin) / (lastWeeks+nextWeeks+2);
    heightCalc();

    return data;
  }

  function xyzCalc(data){
    if(!data || data.length < 1){
      data = [{x:'a',y:'b',z:0}];
    }
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
    cellSize = (Math.min(width,height) - margin) / (a.length+1);
    columnId = (d,i) => d && d.length > 1 ? d[0].y : i;

    return matrix;
  }

  function _impl(context) {
    let selection = context.selection ? context.selection() : context,
        transition = (context.selection !== undefined);

    let _background = background;
    if (_background === undefined) {
      _background = display[theme].background;
    }

    selection.each(function(data) {
      height = height || Math.round(width * DEFAULT_ASPECT);
      data = type === 'calendar' ? dateValueCalc(data) : xyzCalc(data);
      let node = select(this);
      // SVG element
      let sid = null;
      if (id) sid = 'svg-' + id;
      let root = svg(sid).width(width).height(height).margin(margin).scale(scale).background(_background);
      let tnode = node;
      if (transition === true) {
        tnode = node.transition(context);
      }
      tnode.call(root);
      let snode = node.select(root.self());
      let rootG = snode.select(root.child());

      let elmS = rootG.select(_impl.self());
      if (elmS.empty()) {
        elmS = rootG.append('g').attr('class', classed).attr('id', id);
      }

      var column = elmS.selectAll('g').data(data, columnId);
      column.exit().remove();
      column = column.enter()
          .append('g')
          .attr('id', columnId)
        .merge(column);

      var square = column.selectAll('.square').data((d) => d)
      square.exit().remove();
      square = square.enter()
          .append('rect')
            .attr('class', 'square')
          .merge(square);


      var yAxis = elmS.selectAll('.ylabels').data(yAxisData)
      yAxis.exit().remove();
      yAxis = yAxis.enter()
          .append('text')
          .attr('class','ylabels')
        .merge(yAxis)


      var xAxis = elmS.selectAll('.xlabels').data(xAxisData, d => (d.date || d))
      xAxis.exit().remove();
      xAxis = xAxis.enter()
        .append('text')
          .attr('class', 'xlabels')
        .merge(xAxis)

    
      if (transition === true) {
        column = column.transition(context);
        square = square.transition(context);
        xAxis = xAxis.transition(context);
        yAxis = yAxis.transition(context);
      }
      //TODO: push to the left for long names on xAxis
      column.attr('transform', (_,i) => translate( i * cellSize , DEFAULT_AXIS_PADDING));
      square.attr('width', cellSize)
          .attr('height', cellSize)
          .attr('data-x', dX)
          .attr('y', squareY)
          .style('fill', d => d.z ? colorScale(d.z) : '');

      xAxis.attr('transform', (d,i) => translate( (d.order || i) * cellSize, 0 ))
        .text(xAxisText)
        .attr('x', cellSize/2)
        .style('line-height', cellSize);

      yAxis.attr('transform', translate( 0, cellSize/2 + DEFAULT_AXIS_PADDING ))
          .attr('y', squareY)
          .attr('x', -DEFAULT_AXIS_PADDING)
          .style('line-height', cellSize)
          .text(yAxisText);

      let _style = style;
      if (_style == null) {
        _style = _impl.defaultStyle();
      }

      var defsEl = snode.select('defs');
      var styleEl = defsEl.selectAll('style').data(_style ? [ _style ] : []);
      styleEl.exit().remove();
      styleEl = styleEl.enter().append('style').attr('type', 'text/css').merge(styleEl);
      styleEl.text(_style);

    });
  }
  _impl.self = function() { return 'g' + (id ?  '#' + id : '.' + classed); }

  _impl.id = function() { return id; };
  
  _impl.defaultStyle = () => `
                  ${fonts.variable.cssImport}
                  ${fonts.fixed.cssImport}  

                  ${_impl.self()} text { 
                                        font-family: ${fonts.fixed.family};
                                        font-size: ${fonts.fixed.sizeForWidth(width)};
                                        font-weight: ${fonts.fixed.weightMonochrome}; 
                                        fill: ${display[theme].text}; 
                                      }
                  ${_impl.self()} text.xlabels {
                                        text-anchor: middle;
                                      }
                  ${_impl.self()} text.ylabels {
                                        text-anchor: middle;
                                        alignment-baseline: middle;
                                      }
                  ${_impl.self()} .square {
                                        fill: ${EMPTY_COLOR};
                                        stroke: ${display[theme].background};
                                        stroke-width: .125rem;
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
    return arguments.length ? (colour = _, _impl) : colour;
  };

  _impl.type = function(_) { 
    return arguments.length ? (type = _, _impl) : type 
  };

  _impl.style = function(_) {
    return arguments.length ? (style = _, _impl) : style;
  };

  _impl.starting = function(_) {
    return arguments.length ? (starting = _, _impl) : starting;
  };

  return _impl;
}
