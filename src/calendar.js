import { select } from 'd3-selection';
import * as d3TimeFormat from 'd3-time-format';
import { sum, extent } from 'd3-array';
import { nest} from 'd3-collection';
import { timeSunday, timeSundays, timeDays, timeWeek} from 'd3-time';
import { scaleQuantize } from 'd3-scale';
import { html as svg } from '@redsift/d3-rs-svg';

export default function chart(id) {
  var defaultColours = {
    green: ['#b0e288', '#58d655', '#2bb65b', '#00a500', '#016701'],
    blue: ['#7fcbeb', '#4875e3', '#2a1dc4', '#002ca5', '#00103a'],
    purple: ['#fccdfc', '#df7bdf', '#cc48cc', '#bb2dbb', '#890089']
  };

  var classed = 'calendar-chart',
      dateFormat = d3TimeFormat.timeFormat('%Y-%m-%d'),
      dateIdFormat = d3TimeFormat.timeFormat('%Y%U'),
      // dateDisplayFormat = d3.timeFormat('%d %b %Y'),
      weekId = d => dateIdFormat(new Date(d[0].date)),
      width = 800,
      height = null,
      lastWeeks = 52,
      spaceToSizeRatio = 0.15,
      scale = 1.0,
      margin = 20,
      cellSize = (width-2*margin) / ((lastWeeks+1) * (1+spaceToSizeRatio)),
      cellSpacing = cellSize * spaceToSizeRatio,
      colours = defaultColours.green;

  function fullCalendar(w, data){
    var today = Date.now();
    var dataByDate = nest()
      .key(d => dateFormat(new Date(d.date)))
      .rollup(d => sum(d, g => +g.value))
      .map(data);

    return timeSundays(timeWeek.offset(today, -w-1), today)
        .map(sunday => timeDays(
            Math.max(timeSunday.offset(today, -w), sunday),
            Math.min(today, timeWeek.offset(sunday, 1))
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
      cellSize = (width - 2*margin) / ((lastWeeks+1) * (1+spaceToSizeRatio)),
      cellSpacing = cellSize * spaceToSizeRatio;
      var suggestedHeight = 8 * cellSize * (1+spaceToSizeRatio) + margin;
      // check for the stricter constraint
      if(height && suggestedHeight > height){
        cellSize = (height-margin) / (8 * (1+spaceToSizeRatio));
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

      data = fullCalendar(lastWeeks, data);
      console.log(data);
      var wS = elmS.selectAll('g').data(data, weekId);
      var week = wS;
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
            .style('fill', '#f2f2f2')
          .merge(day)

      var xScale = d3.scaleTime()
          .domain([new Date(data[1][0].date), new Date(data[1][6].date)])
          .range([cellSize/2, 6.5* cellSize * (1+spaceToSizeRatio)]);

      var dayAxis = d3.axisLeft()
        .scale(xScale)
        .ticks(3)
        .tickFormat(d => d3TimeFormat.timeFormat('%a')(d)[0]);

      elmS.append('g')
        .attr("class", "day axis")
        .attr('transform', 'translate('+ margin + ','+ (margin+8) +')')
        .call(dayAxis);

      var months = wS;
      months.exit().remove();

      months = months.enter()
        .filter(d => new Date(d[0].date).getDate() <= 7)
        .append('text')
        .attr('transform', (_,i) => 'translate(' + ( i * (cellSize + cellSpacing) + margin) + ', ' +margin + ')')
        .attr('x', cellSize/2)
        .style('text-anchor', 'middle')
        .style('fill', '#000')
        .text(d => d3TimeFormat.timeFormat('%b')(new Date(d[0].date)))


      // hide axis lines and ticks
      var axis = elmS.selectAll('.axis')
      axis.style('shape-rendering', 'crispEdges');
      axis.selectAll('path').style('display', 'none');
      axis.selectAll('line').style('display', 'none');
    
      if (transition === true) {
        week = week.transition(context);
        day = day.transition(context);
      }

      week.attr('transform', (_,i) => 'translate(' + ( i * (cellSize + cellSpacing) + margin+1) + ', ' + (margin+8) + ')');
      day.attr('width', cellSize)
          .attr('height', cellSize)
          .attr('y', d => new Date(d.date).getDay() * (cellSize + cellSpacing) )
          .style('fill', d => d.value ? quantize(d.value) : '#f2f2f2');

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
    var suggestedHeight = 8 * cellSize * (1+spaceToSizeRatio) + margin;
    if(suggestedHeight > _){
        cellSize = (height-margin) / (8 * (1+spaceToSizeRatio));
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
