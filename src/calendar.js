/**
 * Copyright (c) 2016Redsift Limited. All rights reserved.
*/
import { select } from 'd3-selection';
import * as d3TimeFormat from 'd3-time-format';
import { sum, extent } from 'd3-array';
import { nest} from 'd3-collection';
import { timeSunday, timeSundays, timeDays, timeWeek, timeDay} from 'd3-time';
import { scaleQuantize } from 'd3-scale';
import { html as svg } from '@redsift/d3-rs-svg';
import { tip } from '@redsift/d3-rs-tip';

export default function chart(id) {
  var defaultColours = {
    green: ['#b0e288', '#58d655', '#2bb65b', '#00a500', '#016701'],
    blue: ['#7fcbeb', '#4875e3', '#2a1dc4', '#002ca5', '#00103a'],
    purple: ['#fccdfc', '#df7bdf', '#cc48cc', '#bb2dbb', '#890089']
  };

  var classed = 'calendar-chart',
      dateFormat = d3TimeFormat.timeFormat('%Y-%m-%d'),
      dateIdFormat = d3TimeFormat.timeFormat('%Y%U'),
      weekId = d => dateIdFormat(new Date(d[0].date)),
      dayNum = d => new Date(d.date).getDay(),
      translate = (x,y) => ['translate(',x,y,')'].join(' '),
      width = 800,
      height = null,
      lastWeeks = 0,
      nextWeeks = 0,
      spaceToSizeRatio = 0.15,
      scale = 1.0,
      cellSize = width / ((lastWeeks+nextWeeks+2) * (1+spaceToSizeRatio)),
      cellSpacing = cellSize * spaceToSizeRatio,
      colours = defaultColours.green;

  function fullCalendar(lw, nw, data){
    var today = Date.now();
    var dataByDate = nest()
      .key(d => dateFormat(new Date(d.date)))
      .rollup(d => sum(d, g => +g.value))
      .map(data);

    var sunNumB = lw > 0 ? timeWeek.offset(today, -lw-1) : today;
    var sunNumE = nw > 0 ? timeWeek.offset(today, lw > 0 ? nw : nw+1) : today;
    var timeDaysPast = s => timeDays(
      Math.max(timeSunday.offset(today, -lw), s),
      Math.min(today, timeWeek.offset(s, 1)));
    var timeDaysFuture = s => timeDays(
      Math.max(timeDay.offset(today, -1), timeWeek.offset(s, -1)),
      Math.min(timeSunday.offset(timeDay.offset(today, -1), nw), s));
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

  function _impl(context) {
    if(lastWeeks === 0 && nextWeeks === 0){
      return;
    }
    var selection = context.selection ? context.selection() : context,
        transition = (context.selection !== undefined);

    selection.each(function(data) {
      cellSize = width / ((lastWeeks+nextWeeks+2) * (1+spaceToSizeRatio)),
      cellSpacing = cellSize * spaceToSizeRatio;
      var suggestedHeight = 8 * cellSize * (1+spaceToSizeRatio);
      // check for the stricter constraint
      if(height && suggestedHeight > height){
        cellSize = height / (8 * (1+spaceToSizeRatio));
        cellSpacing = cellSize * spaceToSizeRatio;
      }else{
        height = suggestedHeight;
      }

      var node = select(this); 
      var root = svg().width(width).height(height).scale(scale).margin(0);
      var tnode = node;
      if (transition) {
        tnode = node.transition(context);
      }
      tnode.call(root);

      var elmS = node.select(root.child());

      var quantize = scaleQuantize()
        .domain(extent(data, d => d.value))
        .range(colours);

      data = fullCalendar(lastWeeks, nextWeeks, data);

      var week = elmS.selectAll('g').data(data, weekId);
      week.exit().remove();
      week = week.enter()
          .append('g')
          .attr('id', weekId)
        .merge(week);

      var day = week.selectAll('.day').data((d) => d)
      day.exit().transition()
        .attr('width', 0)
        .attr('height', 0)
        .attr('y', d => dayNum(d) * (cellSize + cellSpacing))
        .remove();
      day = day.enter()
          .append('rect')
            .attr('class', 'day')
            .attr('data-date', d => dateFormat(new Date(d.date)))
            .style('fill', '#f2f2f2')
          .merge(day);

      var weekDays = elmS.selectAll('.wday').data(data[1])
      weekDays.exit().transition().remove();
      weekDays = weekDays.enter()
          .append('text')
          .attr('class','wday')
          .style('text-anchor', 'middle')
        .merge(weekDays)
          .attr('x', cellSize/2)
          .style('line-height', cellSize)
          .style('font-size', cellSize*0.6);

      var monthNames = data
        .map((d,i) => ({order: i, date: d[0].date}))
        .filter((d,i) => i>0 && new Date(d.date).getDate() <= 7);
      var months = elmS.selectAll('.months').data(monthNames,d => d.date)
      months.exit().transition().remove();
      months = months.enter()
        .append('text')
          .attr('class', 'months')
          .text(d => d3TimeFormat.timeFormat('%b')(new Date(d.date)))
          .style('text-anchor', 'middle')
          .style('fill', '#000')
        .merge(months)
          .style('line-height', cellSize)
          .style('font-size', cellSize*0.5);

    
      if (transition === true) {
        week = week.transition(context);
        day = day.transition(context);
        months = months.transition(context);
        weekDays = weekDays.transition(context);
      }

      week.attr('transform', (_,i) => translate( ++i * (cellSize + cellSpacing) , cellSize + 2*cellSpacing));
      day.attr('width', cellSize)
          .attr('height', cellSize)
          .attr('y', d => dayNum(d) * (cellSize + cellSpacing) )
          .style('fill', d => d.value ? quantize(d.value) : '#f2f2f2');

      months.attr('transform', d => translate( ++d.order * (cellSize + cellSpacing), cellSize ))
        .attr('x', cellSize/2)
        .style('line-height', cellSize)
        .style('font-size', cellSize*0.5);

      weekDays.attr('transform', translate( 0 , 2*cellSize))
          .attr('y', d => dayNum(d) * (cellSize + cellSpacing) )
          .attr('x', cellSize/2)
          .style('line-height', cellSize)
          .style('font-size', cellSize*0.6)
          .text(d => d3TimeFormat.timeFormat('%a')(new Date(d.date))[0])
          .style('display', d => dayNum(d)%2 ? '' : 'none');

    });
  }
  _impl.self = function() { return 'g' + (id ?  '#' + id : '.' + classed); }

  _impl.id = function() {
    return id;
  };
    
  _impl.classed = function(_) {
    return arguments.length ? (classed = _, _impl) : classed;
  };

  _impl.width = function(_) {
    return arguments.length ? (width = +_, _impl) : width;
  };

  _impl.height = function(_) {
    if(!arguments.length){
      return height;
    }
    var suggestedHeight = 8 * cellSize * (1+spaceToSizeRatio);
    if(suggestedHeight > +_){
        cellSize = height / (8 * (1+spaceToSizeRatio));
        cellSpacing = cellSize * spaceToSizeRatio;
      }
    height = +_;

    return _impl
  };

  _impl.scale = function(value) {
    return arguments.length ? (scale = value, _impl) : scale;
  }; 

  _impl.lastWeeks = function(_) {
    return arguments.length ? (lastWeeks = +_, _impl) : lastWeeks;
  };

  _impl.nextWeeks = function(_) {
    return arguments.length ? (nextWeeks = +_, _impl) : nextWeeks;
  };

  _impl.colours = function(_) {
    if(!arguments.length){
      return colours;
    }
    if (toString.call(_) === '[object Array]'){
      colours = _
    }else{
      colours = defaultColours[_]
    }
    return _impl;
  };

  return _impl;
}
