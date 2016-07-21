var tape = require("@redsift/tape-reel")("<div id='test'></div>");
    d3 = require("d3-selection"),
    squares = require("../");

tape("sqaures html() generates sth with no data", function(t) {
    var host = squares.html();
    var el = d3.select('#test');

    // nothing supplied
    el.call(host);
    t.equal(el.selectAll('svg').size(), 1);
    
    // empty datum
    el.datum([]).call(host);
    t.equal(el.selectAll('svg').size(), 1);
    
    t.end();
});

tape("calendar html() generates sth with no data", function(t) {
    var host = squares.html().type('calendar');
    var el = d3.select('#test');

    // nothing supplied
    el.call(host);
    t.equal(el.selectAll('svg').size(), 1);
    
    // empty datum
    el.datum([]).call(host);
    t.equal(el.selectAll('svg').size(), 1);
    
    t.end();
});

tape("calendar html() testing parameters", function(t) {
    var el = d3.select('#test');
    //last weeks
    var lw = 12;
    el.datum([]).call(squares.html('calendar').type('calendar').lastWeeks(lw));
    t.equal(el.selectAll('svg').size(), 1);
    t.equal(el.selectAll('#calendar > g').size(), 1+lw+lw/4);

    //next weeks
    var nw = 12;
    el.datum([]).call(squares.html('calendar').type('calendar').nextWeeks(nw));
    t.equal(el.selectAll('svg').size(), 1);
    t.equal(el.selectAll('#calendar > g').size(), 1+nw+nw/4);

    //both next and last weeks
    el.datum([]).call(squares.html('calendar').type('calendar').lastWeeks(lw).nextWeeks(nw));
    t.equal(el.selectAll('svg').size(), 1);
    t.equal(el.selectAll('#calendar > g').size(), 1+lw+nw+(lw+nw)/4);

    // with some data
    var data = [ 
      {d: 1462057200000, v: 10},
      {d: 1462057200000, v: 20},
      {d: 1462143600000, v: 5},
      {d: 1464822000000, v: 15} ];
    el.datum([]).call(squares.html('calendar').type('calendar').lastWeeks(lw));
    t.equal(el.selectAll('#calendar > g').size(), 1+lw+lw/4);
    
    t.end();
})
