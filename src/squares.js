/**
 * Copyright (c) 2016Redsift Limited. All rights reserved.
*/
import { select } from 'd3-selection';
import {timeFormat} from 'd3-time-format';
import { sum, extent, max, min, range } from 'd3-array';
import { nest} from 'd3-collection';
import {
  timeHours,
  timeDay, timeDays,
  timeWeek,
  timeSunday, timeSundays,
  utcSunday, utcSundays,
  timeMonday, timeMondays,
  utcMonday, utcMondays,
  timeTuesday, timeTuesdays,
  utcTuesday, utcTuesdays,
  timeWednesday, timeWednesdays,
  utcWednesday, utcWednesdays,
  timeThursday, timeThursdays,
  utcThursday, utcThursdays,
  timeFriday, timeFridays,
  utcFriday, utcFridays,
  timeSaturday, timeSaturdays,
  utcSaturday, utcSaturdays
} from 'd3-time';
import { scaleQuantize } from 'd3-scale';
import { html as svg } from '@redsift/d3-rs-svg';
import { 
  presentation10,
  display,
  fonts,
  widths
} from '@redsift/d3-rs-theme';

const DEFAULT_ASPECT = 160 / 420;
const DEFAULT_INSET = 24;
const DEFAULT_AXIS_PADDING = 8;
const EMPTY_COLOR = '#f2f2f2';
const timeMap = {
  sunday: [timeSunday, timeSundays],
  monday: [timeMonday, timeMondays],
  tuesday: [timeTuesday, timeTuesdays],
  wednesday: [timeWednesday, timeWednesdays],
  thursday: [timeThursday, timeThursdays],
  friday: [timeFriday, timeFridays],
  saturday: [timeSaturday, timeSaturdays],
  utcSunday: [utcSunday, utcSundays],
  utcMonday: [utcMonday, utcMondays],
  utcTuesday: [utcTuesday, utcTuesdays],
  utcWednesday: [utcWednesday, utcWednesdays],
  utcThursday: [utcThursday, utcThursdays],
  utcFriday: [utcFriday, utcFridays],
  utcSaturday: [utcSaturday, utcSaturdays],
}

export default function chart(id) {

  let classed = 'squares-chart',
      theme = 'light',
      background = undefined,
      style = undefined,
      inset = null,
      zfield = null,
      starting = 'sunday',
      dateFormat = timeFormat('%Y-%m-%d'),
      dateIdFormat = timeFormat('%Y%U'),
      D = d => new Date(d),
      dayWeekNum = d => D(d).getDay(),
      dayMonthNum = d => D(d).getDate(),
      dayHourFormat = timeFormat('%w-%-H'),
      isFirstMonth = d => dayMonthNum(d) === 1,
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
      xLabelAnchor = 'middle',
      xLabelBaseline = '',
      xLabelTranslate = translate,
      animationDirection = -1,
      margin = 26,
      width = 600,
      height = null,
      lastWeeks = 0,
      nextWeeks = 0,
      type = 'matrix',
      subType = null,
      scale = 1.0,
      calendarColumn = 8,
      cellSize = (width - margin) / (lastWeeks+nextWeeks+2 +(lastWeeks+nextWeeks/4)),
      colour = 'green';

  let palette = (c) =>[
    presentation10.lighter[presentation10.names[c]],
    presentation10.standard[presentation10.names[c]],
    presentation10.darker[presentation10.names[c]]  
  ]

  function fullCalendar(lw, nw, dataByDate){
    var today = Date.now();
    const tMD = timeMap[starting][0];
    const tMDs = timeMap[starting][1];

    var sunNumB = lw > 0 ? timeWeek.offset(today, -lw-1) : today;
    var sunNumE = nw > 0 ? timeWeek.offset(today, lw > 0 ? nw : nw+1) : today;
    var timeDaysPast = s => timeDays(
      Math.max(tMD.offset(today, -lw), s),
      Math.min(today, timeWeek.offset(s, 1)));
    var timeDaysFuture = s => timeDays(
      Math.max(timeDay.offset(today, -1), timeWeek.offset(s, -1)),
      Math.min(timeWeek.offset(today, nw), s));
    var timeDaysBoth = s => timeDays(
      Math.max(tMD.offset(timeDay.offset(today, -1), -lw), s),
      Math.min(tMD.offset(today, nw), timeWeek.offset(s, 1)));
    var timeSide = (lw > 0 && nw > 0) ? timeDaysBoth :
                    (lw > 0) ? timeDaysPast :
                      (nw > 0) ? timeDaysFuture : [];

    var result = [];
    tMDs(sunNumB, sunNumE)
      .map(weekDay =>{
        let temp = [];
        timeSide(weekDay).map(d => {
          if(isFirstMonth(d)){
            if(temp.length > 0){
              result.push(temp.slice(0));
              temp = [];
            }else {
              result.push([]);
            }
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

  function hourCalendar(data, inset){
    const tMD = timeMap[starting][0];

    let dataByDayHour = nest()
      .key(d => dayHourFormat(D(d.d)))
      .rollup(d => sum(d, g => g.v))
      .map(data);
    colorScale = scaleQuantize()
        .domain(extent(dataByDayHour.entries(), d => d.value))
        .range(palette(colour));

    columnId = (d,i) => i;


    dX = (d,i) => i+d.x;

    // Just get a Date object at 00:00 hours, the date doesn't matter and it's only for the axis values
    // Date.now is in local time so no need for UTC conversion.
    var aSunday = tMD(Date.now());
    xAxisData = timeHours(timeDay.offset(aSunday,-1), timeDay(aSunday))
    xAxisText = d => timeFormat('%H')(D(d))

    // Just get a Date object to calculate a week starting at the specified day of the week
    // No UTC needed only for axis display
    yAxisData = timeDays(tMD.offset(tMD(Date.now()), -1), tMD(Date.now()))
    yAxisText = d => timeFormat('%a')(D(d))[0]

    var dhMatrix = range(24).map(h =>
        range(7).map(wd =>{
          // here we can apply the local format the user might have chosen
          const weekDay = timeFormat('%a')(yAxisData[wd]);
          const hourDay = timeFormat('%H')(xAxisData[h]);
          return {
            x: [weekDay, '@', hourDay].join(' '),
            z: dataByDayHour.get([wd,'-',h].join('')) || 0
          }
        })
      )

    const extra = DEFAULT_AXIS_PADDING + margin + inset.left + inset.right;
    cellSize = (width - extra) / dhMatrix.length;
    heightCalc(null, inset);

    return dhMatrix;
  }

  function heightCalc(override, inset){
    const _inset = inset ? inset.top + inset.bottom : 0;
    const extra = DEFAULT_AXIS_PADDING + margin + _inset;
    const suggestedHeight = calendarColumn * cellSize;
    // check for the stricter constraint
    if(height && suggestedHeight > (height-extra)){
      cellSize = (height - extra) / calendarColumn;
    }else{
      height = +override || (suggestedHeight + extra);
    }
  }

  function dateValueCalc(data, inset){
    data = data || [];
    lastWeeks = lastWeeks === 0 && nextWeeks === 0 ? 12 : lastWeeks;
    let retroDate = d => d ? (d.d || d.x) : null;
    let retroValue = d => (+d.v || +(dZ(d)));
    const tMD = timeMap[starting][0];
    const checkStarting = dayWeekNum(tMD(Date.now()));
    let dataByDate = nest()
      .key(d => dateFormat(D(retroDate(d))))
      .rollup(d => sum(d, retroValue))
      .map(data);

    colorScale = scaleQuantize()
        .domain(extent(dataByDate.entries(), d => d.value))
        .range(palette(colour));

    columnId = (d,i) => {
      if(d && d.length < 1){
        return `s${i}`;
      }
      const t = dateIdFormat(D(retroDate(d[0])))
      return d.length < 7 && isFirstMonth(retroDate(d[0])) ? `${t}b` : t;
    };
    // used for squares and yAxis
    squareY = d => {
      const v = d.x || d;
      let e = 0;
      if(dayWeekNum(v) < checkStarting) {
        e = dayWeekNum(v) + 6 - checkStarting
      }else{
        e = dayWeekNum(v) - checkStarting
      }
      return e * cellSize

    }
    dX = (d) => dateFormat(D(retroDate(d)))
    xAxisText = d => timeFormat('%b')(D(retroDate(d)))
    yAxisText = d => timeFormat('%a')(D(d))[0]

    yAxisData = timeDays(tMD.offset(tMD(Date.now()), -1), tMD(Date.now()))

    data = fullCalendar(lastWeeks, nextWeeks, dataByDate);
    var monthNames = data
        .map((d,i) => ({order: i, d: retroDate(d[0])}))
        .filter((d,i) => i>0 && d && dayMonthNum(d.d) <= 7 && dayWeekNum(retroDate(d)) === checkStarting );
    xAxisData = monthNames;

    const extra = DEFAULT_AXIS_PADDING + margin + inset.left + inset.right;
    cellSize = (width - extra) / data.length;
    heightCalc(null, inset);

    return data;
  }

  function coocCalc(data){
    if(!data || data.length < 1){
      data = [{x:'a',y:'b',z:0}];
    }
    let matrix = [];
    let set = new Set();

    // get unique x and y
    data.forEach((v)=>{  
      set.add(dX(v));
      set.add(dY(v));
    })

    var nodes = Array.from(set);
    var p ={};
    nodes.map(v => { p[v]={} });
    nodes.map(y => {
      nodes.map(x => {
        p[y][x] = 0; 
        p[x][y] = 0; 
        })
    });
    data.forEach((v) => { 
      p[dY(v)][dX(v)] = zfield ? dZ(v)[zfield] : dZ(v);
    });
    matrix = nodes.map(y => nodes.map(x => ({
        x: x,
        y: y,
        z: p[x][y]
      }))
    );

    yAxisData = nodes;
    xAxisData = nodes;

    return matrix;
  }

  function matrixCalc(data){
    if(!data || data.length < 1){
      data = [{x:'a',y:'b',z:0}];
    }
    let matrix = [];
    let setX = new Set();
    let setY = new Set();

    // get unique x and y
    data.forEach((v)=>{  
      setX.add(dX(v));
      setY.add(dY(v));
    })

    var nodesX = Array.from(setX);
    var nodesY = Array.from(setY);
    var p ={};
    nodesY.map(v => { p[v]={} });
    nodesY.map(y => {
      nodesX.map(x => {
        p[y][x] = 0;
        })
    });
    data.forEach((v) => { 
      p[dY(v)][dX(v)] = zfield ? dZ(v)[zfield] : dZ(v);
    });
    matrix = nodesY.map(y => 
      nodesX.map(x => ({
        x: x,
        y: y,
        z: p[y][x]
      }))
    );
    yAxisData = nodesX;
    xAxisData = nodesY;

    return matrix;
  }

  function xyzCalc(data, inset){
    let matrix = subType === 'cooc' ? coocCalc(data) : matrixCalc(data);

    colorScale = scaleQuantize()
        .domain([
          min(matrix, d => min(d, dZ)),
          max(matrix, d => max(d, dZ))
          ])
        .range(palette(colour))

    const _w = width - (DEFAULT_AXIS_PADDING + margin + inset.left + inset.right);
    const _h = height - (DEFAULT_AXIS_PADDING + margin + inset.top + inset.bottom);
    cellSize = Math.min(_w,_h) / (subType === 'cooc' ? matrix.length : Math.max(matrix.length, matrix[0].length)+1);
    columnId = (d,i) => d && d.length > 1 ? dY(d[0]) : i;
    xLabelAnchor = 'start';
    xLabelBaseline = 'middle';
    xLabelTranslate = (x,y) => `${translate(x,y)}rotate(-90)`;

    return matrix;
  }

  function _impl(context) {
    let selection = context.selection ? context.selection() : context,
        transition = (context.selection !== undefined);

    let _background = background;
    if (_background === undefined) {
      _background = display[theme].background;
    }

    let _inset = inset;
    if (_inset == null) {
      _inset = { top: DEFAULT_INSET, bottom: 0, left: DEFAULT_INSET, right: 0 };
      // if (axisValue === 'left') {
      //   _inset.left = DEFAULT_INSET;
      // } else {
      //   _inset.right = DEFAULT_INSET;
      // }
    } else if (typeof _inset === 'object') {
      _inset = { top: _inset.top, bottom: _inset.bottom, left: _inset.left, right: _inset.right };
    } else {
      _inset = { top: _inset, bottom: _inset, left: _inset, right: _inset };
    }

    selection.each(function(data) {
      height = height || Math.round(width * DEFAULT_ASPECT);
      const tst = [type, subType].join('.');
      const types ={
        'calendar.days': dateValueCalc,
        'calendar.hours': hourCalendar
      }
      data = types[tst] ? types[tst](data, _inset) : xyzCalc(data, _inset);
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

      let column = elmS.selectAll('g').data(data, columnId);
      let eColumn = column.exit();
      column = column.enter()
          .append('g')
          .attr('id', columnId)
          .attr('transform', (_,i) => translate( animationDirection*(_inset.left + (++i * cellSize)+width), _inset.top + DEFAULT_AXIS_PADDING))
        .merge(column);

      let square = column.selectAll('.square').data(dI, dX)
      let eSquare = square.exit();
      square = square.enter()
          .append('rect')
            .attr('class', 'square')
            .attr('width', cellSize)
            .attr('height', cellSize)
            .attr('data-x', dX)
            .attr('x', animationDirection*(_inset.left + margin + width))
            .attr('y', squareY)
            .attr('fill', d => dZ(d) ? colorScale(dZ(d)) : EMPTY_COLOR)
          .merge(square)


      let yAxis = elmS.selectAll('.ylabels').data(yAxisData, dI)
      let eYAxis = yAxis.exit();
      yAxis = yAxis.enter()
          .append('text')
          .attr('class','ylabels')
          .attr('transform', translate( animationDirection*(_inset.left +width), cellSize/2 + DEFAULT_AXIS_PADDING + _inset.top ))
        .merge(yAxis)


      let xAxis = elmS.selectAll('.xlabels').data(xAxisData, d => (d.d || d))
      let eXAxis = xAxis.exit();
      xAxis = xAxis.enter()
        .append('text')
          .attr('class', 'xlabels')
          .attr('transform', (d,i) => xLabelTranslate( animationDirection*(_inset.left + (d.order || i) * cellSize + width), _inset.top))
        .merge(xAxis)

      if (transition === true) {
        column = column.transition(context);
        eColumn = eColumn.transition(context);
        square = square.transition(context);
        eSquare = eSquare.transition(context);
        xAxis = xAxis.transition(context);
        eXAxis = eXAxis.transition(context);
        yAxis = yAxis.transition(context);
        eYAxis = eYAxis.transition(context);
      }

      column.attr('transform', (_,i) => translate( _inset.left + (i * cellSize), _inset.top + DEFAULT_AXIS_PADDING));
      eColumn.attr('transform', (_,i) => translate( animationDirection*(_inset.left + (++i * cellSize)+width), _inset.top + DEFAULT_AXIS_PADDING))
        .remove();
      square.attr('y', squareY)
          .attr('width', cellSize)
          .attr('height', cellSize)
          .attr('x', 0)
          .attr('fill', d => dZ(d) ? colorScale(dZ(d)) : EMPTY_COLOR)

      eSquare.attr('width', cellSize)
            .attr('height', cellSize)
            .attr('data-x', dX)
            .attr('x', animationDirection*(_inset.left + margin + width))
            .attr('y', squareY)
            .attr('fill', d => dZ(d) ? colorScale(dZ(d)) : EMPTY_COLOR)
          .remove()

      xAxis.attr('transform', (d,i) => xLabelTranslate( _inset.left + (d.order || i) * cellSize, _inset.top))
        .text(xAxisText)
        .attr('line-height', cellSize)

      if(type === 'matrix'){
        xAxis.attr('y', cellSize/2)
        xAxis.attr('x', 0)
      }else {
        xAxis.attr('x', cellSize/2)
      }

      if(type === 'calendar' && subType === 'days'){
        eXAxis.attr('x', animationDirection*width)
      }else{
        eXAxis.attr('x', height)
      }
      eXAxis.remove()

      yAxis.attr('transform', translate( _inset.left, cellSize/2 + DEFAULT_AXIS_PADDING + _inset.top ))
          .text(yAxisText)
          .attr('y', squareY)
          .attr('x', -DEFAULT_AXIS_PADDING)
          .attr('line-height', cellSize)
      
      eYAxis.attr('x', animationDirection*width)
        .remove()

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
                                        text-anchor: ${xLabelAnchor};
                                        alignment-baseline: ${xLabelBaseline};
                                      }
                  ${_impl.self()} text.ylabels {
                                        text-anchor: end;
                                        alignment-baseline: middle;
                                      }
                  ${_impl.self()} .square {
                                        stroke: ${display[theme].background};
                                        stroke-width: ${widths.grid};
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
    if(!arguments.length){
      return subType ? [type, subType].join('.') : type ;
    }
    const s = _.split('.')
    type = s[0];
    subType = s.length > 1 ? s[1] : null;

    return _impl
  };

  _impl.style = function(_) {
    return arguments.length ? (style = _, _impl) : style;
  };

  _impl.starting = function(_) {
    return arguments.length ? 
      timeMap.hasOwnProperty(_) ? (starting = _, _impl) : _impl
      : starting;
  };

  _impl.inset = function(_) {
    return arguments.length ? (inset = _, _impl) : inset;
  };

  _impl.zfield = function(_) {
    return arguments.length ? (zfield = _, _impl) : zfield;
  };

  return _impl;
}
