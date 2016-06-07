import { select } from 'd3-selection';
import { html as svg } from '@redsift/d3-rs-svg';

export default function chart(id) {
  var coloursGreen = ['#b0e288', '#58d655', '#2bb65b', '#00a500', '#016701'],
  coloursBlue = ['#7fcbeb', '#4875e3', '#2a1dc4', '#002ca5', '#00103a'],
  coloursPurple = ['#fccdfc', '#df7bdf', '#cc48cc', '#bb2dbb', '#890089'];

  var classed = 'calendar-chart',
      dateFormat = d3.timeFormat('%Y-%m-%d'),
      dateDisplayFormat = d3.timeFormat('%d %b %Y'),
      width = 600,
      height = null,
      lastWeeks = 52,
      spaceToSizeRatio = 0.15,
      colours = coloursGreen;

  function fullCalendar(w, data){
    console.log('firing', w, data.length);
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
      var cellSize = width / ((lastWeeks+1) * (1+spaceToSizeRatio)),
        cellSpacing = cellSize * spaceToSizeRatio;
        var suggestedHeight = 10 * cellSize * (1+spaceToSizeRatio);
        // check fir the stricter constraint
        if(height && suggestedHeight > height){
          cellSize = height / (10 * (1+spaceToSizeRatio));
          cellSpacing = cellSize * spaceToSizeRatio;
        }else{
          height = suggestedHeight;
        }
      console.log('cellSize', cellSize)
      console.log(width, height, suggestedHeight);
      var node = select(this); 
      var root = svg().width(width).height(height).margin(0);
      var tnode = node;
      if (transition) {
        tnode = node.transition(context);
      }
      tnode.call(root);

      var elmS = node.select(root.child());
      
      var quantize = d3.scaleQuantize()
        .domain(d3.extent(data, d => d.value))
        .range(colours);

      var week = elmS.selectAll('g').data(fullCalendar(lastWeeks, data));
      week.exit().remove();
      week = week.enter()
            .append('g')
            .attr('transform', (_,i) => 'translate(' + ( i * (cellSize + cellSpacing)) + ', 0)')
          .merge(week);

      var day = week.selectAll('.day').data((d) => d)
      day.exit().remove();
      day = day.enter()
          .append('rect')
            .attr('class', 'day')
            .attr('width', cellSize)
            .attr('height', cellSize)
            .attr('y', d => (new Date(d.date).getDay() * (cellSize + cellSpacing)))
            .attr('data-date', d => dateFormat(new Date(d.date)))
          .merge(day)
            .style('fill', d => d.value ? quantize(d.value) : '');


      if (transition === true) {
        week = week.transition(context);
        day = day.transition(context);

      week.attr('transform', (_,i) => 'translate(' + ( i * (cellSize + cellSpacing)) + ', 0)');
      day.attr('width', cellSize)
        .attr('height', cellSize)
        .attr('y', d => new Date(d.date).getDay() * (cellSize + cellSpacing))
        .style('fill', d => d.value ? quantize(d.value) : '');
      }

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
    return arguments.length ? (height = _, _impl) : height;
  };

  _impl.lastWeeks = function(_) {
    return arguments.length ? (lastWeeks = _, _impl) : lastWeeks;
  };

  _impl.colours = function(_) {
    return arguments.length ? (colours = _, _impl) : colours;
  };

  return _impl;
}
