import { select } from 'd3-selection';
import * as time from 'd3-time-format';
import { html as svg } from '@redsift/d3-rs-svg';

export default function chart(id) {
  var defaultColours = {
    green: ['#b0e288', '#58d655', '#2bb65b', '#00a500', '#016701'],
    blue: ['#7fcbeb', '#4875e3', '#2a1dc4', '#002ca5', '#00103a'],
    purple: ['#fccdfc', '#df7bdf', '#cc48cc', '#bb2dbb', '#890089']
  };

  var classed = 'calendar-chart',
      dateFormat = time.timeFormat('%Y-%m-%d'),
      dateIdFormat = time.timeFormat('%Y%U'),
      // dateDisplayFormat = d3.timeFormat('%d %b %Y'),
      weekId = d => dateIdFormat(new Date(d[0].date)),
      width = 800,
      height = null,
      lastWeeks = 52,
      spaceToSizeRatio = 0.15,
      scale = 1.0,
      cellSize = width / ((lastWeeks+1) * (1+spaceToSizeRatio)),
      cellSpacing = cellSize * spaceToSizeRatio,
      colours = defaultColours.green;

  function fullCalendar(w, data){
    var today = Date.now();
    var dataByDate = d3.nest()
      .key(d => dateFormat(new Date(d.date)))
      .rollup(d => d3.sum(d, g => +g.value))
      .map(data);

    return d3.timeSundays(d3.timeWeek.offset(today, -w-1), today)
        .map(sunday => d3.timeDays(
            Math.max(d3.timeSunday.offset(today, -w), sunday),
            Math.min(today, d3.timeWeek.offset(sunday, 1))
          ).map(d => ({
              date: dateFormat(d),
              value: dataByDate.get(dateFormat(d)) || 0
            }))
      );
  }

  function _impl(context) {
    var selection = context.selection ? context.selection() : context,
        transition = (context.selection !== undefined);

    selection.each(function(data) {
      cellSize = width / ((lastWeeks+1) * (1+spaceToSizeRatio)),
      cellSpacing = cellSize * spaceToSizeRatio;
      var suggestedHeight = 10 * cellSize * (1+spaceToSizeRatio);
      // check for the stricter constraint
      if(height && suggestedHeight > height){
        cellSize = height / (10 * (1+spaceToSizeRatio));
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
      
      var quantize = d3.scaleQuantize()
        .domain(d3.extent(data, d => d.value))
        .range(colours);

      var week = elmS.selectAll('g').data(fullCalendar(lastWeeks, data), weekId);
      week.exit().remove();
      week = week.enter()
          .append('g')
          .attr('id', weekId)
        .merge(week);

      var day = week.selectAll('.day').data((d) => d)
      day.exit().transition()
        .attr('width', 0)
        .attr('height', 0)
        .attr('y', d => new Date(d.date).getDay() * (cellSize + cellSpacing))
        .remove();
      day = day.enter()
          .append('rect')
            .attr('class', 'day')
            .attr('data-date', d => dateFormat(new Date(d.date)))
          .merge(day)


      if (transition === true) {
        week = week.transition(context);
        day = day.transition(context);
      }


      week.attr('transform', (_,i) => 'translate(' + ( i * (cellSize + cellSpacing)) + ', 0)');
      day.attr('width', cellSize)
          .attr('height', cellSize)
          .attr('y', d => new Date(d.date).getDay() * (cellSize + cellSpacing))
          .style('fill', d => d.value ? quantize(d.value) : '');

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
    return arguments.length ? (width = _, _impl) : width;
  };

  _impl.height = function(_) {
    if(!arguments.length){
      return height;
    }
    var suggestedHeight = 10 * cellSize * (1+spaceToSizeRatio);
    if(suggestedHeight > _){
        cellSize = height / (10 * (1+spaceToSizeRatio));
        cellSpacing = cellSize * spaceToSizeRatio;
      }
    height = _;

    return _impl
  };

  _impl.scale = function(value) {
    return arguments.length ? (scale = value, _impl) : scale;
  }; 

  _impl.lastWeeks = function(_) {
    return arguments.length ? (lastWeeks = _, _impl) : lastWeeks;
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
