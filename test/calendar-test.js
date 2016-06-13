var tape = require("@redsift/tape-reel")("<div id='test'></div>");
    d3 = require("d3-selection"),
    calendar = require("../");
//     svg = require("@redsift/d3-rs-svg"),
tape("html() generates and updates svg", function(t) {
    var data = [];
    
    var host = calendar.html().lastWeeks(50);
    var el = d3.select('#test').datum(data);
    
    // el.call(host);
    // t.equal(el.selectAll('svg').size(), 1);
    

    // el.call(host);
    // t.equal(el.selectAll('g').size(), 53);

    // t.equal(el.text(), data);
    
    // data = 'B';
    // el.datum(data).call(host);
    
    // t.equal(el.text(), data);
    
    t.end();
});
