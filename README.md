# d3-rs-squares

`d3-rs-squares` easily generate either a co-occurrence matrix or a calendar chart.

## Builds

[![Circle CI](https://circleci.com/gh/redsift/d3-rs-squares.svg?style=svg)](https://circleci.com/gh/redsift/d3-rs-squares)
[![npm](https://img.shields.io/npm/v/@redsift/d3-rs-squares.svg?style=flat-square)](https://www.npmjs.com/package/@redsift/d3-rs-squares)
[![MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://raw.githubusercontent.com/redsift/d3-rs-squares/master/LICENSE)

## Example

[View @redsift/d3-rs-squares on Codepen](http://codepen.io/collection/nJKaBZ/)

### Matrix chart

![Sample occurrence chart](https://bricks.redsift.cloud/reusable/d3-rs-squares.svg?_datum=[{%22x%22:%22a1%22,%22y%22:%22b1%22,%22z%22:10},{%22x%22:%22c1%22,%22y%22:%22d1%22,%22z%22:30}])

### Co occurrence chart

![Sample occurrence chart](https://bricks.redsift.cloud/reusable/d3-rs-squares.svg?_datum=[{%22x%22:%22a%22,%22y%22:%22c%22,%22z%22:3},{%22x%22:%22c%22,%22y%22:%22a%22,%22z%22:13}]&type=matrix.cooc)

### Calendar chart

![Sample calendar chart](https://bricks.redsift.cloud/reusable/d3-rs-squares.svg?_datum=[{%22d%22:1470416243000,%22v%22:10},{%22d%22:1470934643000,%22v%22:20}]&type=calendar.days)

## Usage

### Browser
	
	<script src="//static.redsift.io/reusable/d3-rs-squares/latest/d3-rs-squares.umd-es2015.min.js"></script>
	<script>
		// for cooccurence view
		var squares = d3_rs_squares.html();
		...
		//or for calendar view
		var calendar = d3_rs_squares.html().type('calendar').lastWeeks(12);
	</script>
### ES6

	import { chart } from "@redsift/d3-rs-squares";
	let eml = chart.html();
	...
	
### Require

	var chart = require("@redsift/d3-rs-squares");
	var eml = chart.html();
	...

### Data layout
Both displays expect an Array with JSON objects. 

	var data = [{}, {}, ...];

Between the two **types** the layout of the object varies:

For the calendar view the expected JSON object should be:

	{
		d: 1462057200000, // epoch timestamp in milliseconds 
		v: 10
	}

For the co-occurrence matrix the expected JSON object should be:

	{
		x: 'key1', 
		y: 'key2',
		z: 10 // number or object. To access object properties use zfield
	}

### Parameters

|Name|Used In|Description|Transition|Preview
|----|--------|----------|----------|-------|
|`classed`|* |SVG custom class|N| |
|`width`, `height`|* | *Integer* Resize the chart height and width.|Y|[![Preview of width and height](https://bricks.redsift.cloud/reusable/d3-rs-squares.svg?_datum=[{%22x%22:%22a1%22,%22y%22:%22b1%22,%22z%22:10},{%22x%22:%22c1%22,%22y%22:%22d1%22,%22z%22:30}]&width=1000&height=500)](https://bricks.redsift.cloud/reusable/d3-rs-squares.svg?_datum=[{%22x%22:%22a1%22,%22y%22:%22b1%22,%22z%22:10},{%22x%22:%22c1%22,%22y%22:%22d1%22,%22z%22:30}]&width=1000&height=500)<br>Examples: [Bricks](https://bricks.redsift.cloud/reusable/d3-rs-squares.svg?_datum=[{%22x%22:%22a1%22,%22y%22:%22b1%22,%22z%22:10},{%22x%22:%22c1%22,%22y%22:%22d1%22,%22z%22:30}]&width=1000&height=500) / [CodePen](http://codepen.io/geervesh/pen/dNoMab)
|`size`|* | *Integer* SVG container sizes|Y|[![Preview of size](https://bricks.redsift.cloud/reusable/d3-rs-squares.svg?_datum=[{%22x%22:%22a1%22,%22y%22:%22b1%22,%22z%22:10},{%22x%22:%22c1%22,%22y%22:%22d1%22,%22z%22:30}]&size=400)](https://bricks.redsift.cloud/reusable/d3-rs-squares.svg?_datum=[{%22x%22:%22a1%22,%22y%22:%22b1%22,%22z%22:10},{%22x%22:%22c1%22,%22y%22:%22d1%22,%22z%22:30}]&size=400)<br>Examples: [Bricks](https://bricks.redsift.cloud/reusable/d3-rs-squares.svg?_datum=[{%22x%22:%22a1%22,%22y%22:%22b1%22,%22z%22:10},{%22x%22:%22c1%22,%22y%22:%22d1%22,%22z%22:30}]&size=400) / [CodePen](http://codepen.io/geervesh/pen/EZVqvV)
|`scale`|* | *Integer* SVG container sizes|Y|[![Preview of scale](https://bricks.redsift.cloud/reusable/d3-rs-squares.svg?_datum=[{%22x%22:%22a1%22,%22y%22:%22b1%22,%22z%22:10},{%22x%22:%22c1%22,%22y%22:%22d1%22,%22z%22:30}]&scale=2)](https://bricks.redsift.cloud/reusable/d3-rs-squares.svg?_datum=[{%22x%22:%22a1%22,%22y%22:%22b1%22,%22z%22:10},{%22x%22:%22c1%22,%22y%22:%22d1%22,%22z%22:30}]&scale=2)<br>Examples: [Bricks](https://bricks.redsift.cloud/reusable/d3-rs-squares.svg?_datum=[{%22x%22:%22a1%22,%22y%22:%22b1%22,%22z%22:10},{%22x%22:%22c1%22,%22y%22:%22d1%22,%22z%22:30}]&scale=2) / [CodePen](http://codepen.io/geervesh/pen/egpqMm)
|`style`|* | *String* Custom CSS to inject into chart|N| |
|`color`|* | *String, Array* Color palette for the data. Available options from [d3-rs-theme](https://github.com/Redsift/d3-rs-theme#presentation-color-palette) e.g. `'blue'`,`'green'`,`'aqua'`,... | Y| [![Preview of Color](https://bricks.redsift.io/reusable/d3-rs-squares.svg?_datum=[{%20%22y%22:%20%22Plan%22,%20%22x%22:%20%22Jan%22,%20%22z%22:%20100%20},%20{%20%22y%22:%20%22Bonus%22,%20%22x%22:%20%22Feb%22,%20%22z%22:%20460%20},{%20%22y%22:%20%22Plan%22,%20%22x%22:%20%22Mar%22,%22z%22:%20720%20}]&color=aqua)](https://bricks.redsift.io/reusable/d3-rs-squares.svg?_datum=[{%20%22y%22:%20%22Plan%22,%20%22x%22:%20%22Jan%22,%20%22z%22:%20100%20},%20{%20%22y%22:%20%22Bonus%22,%20%22x%22:%20%22Feb%22,%20%22z%22:%20460%20},{%20%22y%22:%20%22Plan%22,%20%22x%22:%20%22Mar%22,%22z%22:%20720%20}]&color=aqua)<br> Examples: [Bricks](https://bricks.redsift.io/reusable/d3-rs-squares.svg?_datum=[{%20%22y%22:%20%22Plan%22,%20%22x%22:%20%22Jan%22,%20%22z%22:%20100%20},%20{%20%22y%22:%20%22Bonus%22,%20%22x%22:%20%22Feb%22,%20%22z%22:%20460%20},{%20%22y%22:%20%22Plan%22,%20%22x%22:%20%22Mar%22,%22z%22:%20720%20}]&color=aqua) / [CodePen](http://codepen.io/geervesh/pen/amvjak)
|`theme`|* | *String* `'light'` (default) or `'dark'` as described in [d3-rs-theme](https://github.com/Redsift/d3-rs-theme) | | [![Preview of Theme](https://bricks.redsift.io/reusable/d3-rs-squares.svg?_datum=[{%20%22y%22:%20%22Plan%22,%20%22x%22:%20%22Jan%22,%20%22z%22:%20100%20},%20{%20%22y%22:%20%22Bonus%22,%20%22x%22:%20%22Feb%22,%20%22z%22:%20460%20},{%20%22y%22:%20%22Plan%22,%20%22x%22:%20%22Mar%22,%22z%22:%20720%20}]&theme=dark)](https://bricks.redsift.io/reusable/d3-rs-squares.svg?_datum=[{%20%22y%22:%20%22Plan%22,%20%22x%22:%20%22Jan%22,%20%22z%22:%20100%20},%20{%20%22y%22:%20%22Bonus%22,%20%22x%22:%20%22Feb%22,%20%22z%22:%20460%20},{%20%22y%22:%20%22Plan%22,%20%22x%22:%20%22Mar%22,%22z%22:%20720%20}]&theme=dark)<br> Examples: [Bricks](https://bricks.redsift.io/reusable/d3-rs-squares.svg?_datum=[{%20%22y%22:%20%22Plan%22,%20%22x%22:%20%22Jan%22,%20%22z%22:%20100%20},%20{%20%22y%22:%20%22Bonus%22,%20%22x%22:%20%22Feb%22,%20%22z%22:%20460%20},{%20%22y%22:%20%22Plan%22,%20%22x%22:%20%22Mar%22,%22z%22:%20720%20}]&theme=dark) / [CodePen](http://codepen.io/geervesh/pen/pEjxEW)
|`inset`|* |  *Integer, Object* Provide additional margin for axis with long keys. Expected object structure `{top: 0, bottom:10, left:10, right:0}`| | [![Preview of Inset](https://bricks.redsift.cloud/reusable/d3-rs-squares.svg?_datum=[{%22x%22:%22a1%22,%22y%22:%22b1%22,%22z%22:10},{%22x%22:%22c1%22,%22y%22:%22d1%22,%22z%22:30}]&inset=20)](https://bricks.redsift.cloud/reusable/d3-rs-squares.svg?_datum=[{%22x%22:%22a1%22,%22y%22:%22b1%22,%22z%22:10},{%22x%22:%22c1%22,%22y%22:%22d1%22,%22z%22:30}]&inset=20)<br>Examples: [Bricks](https://bricks.redsift.cloud/reusable/d3-rs-squares.svg?_datum=[{%22x%22:%22a1%22,%22y%22:%22b1%22,%22z%22:10},{%22x%22:%22c1%22,%22y%22:%22d1%22,%22z%22:30}]&inset=20) / [CodePen](http://codepen.io/geervesh/pen/kkrApj) 
|`zfield`| matrix.* |*String* When `z` field is an object this parameter gives you the ability to use the value under a different key e.g. for `{x:'',y:'',z:{prop1:''}}` to use the value of the `prop1` key pass the name of the key `'prop1'` to the parameter| | Example: [CodePen](http://codepen.io/geervesh/pen/vXNQOy)
|`cellSize`|* | *Integer* Get or override calculated size of cells | | Example: [CodePen](http://codepen.io/geervesh/pen/YGydbg)
|`type`| |`'calendar.days'`, `'calendar.hours'`, `'matrix.cooc'`, `'matrix'`(default)|  | [![Preview of type](https://bricks.redsift.cloud/reusable/d3-rs-squares.svg?_datum=[%20{%22d%22:%201462057200000,%20%22v%22:%2010},%20{%22d%22:%201462402800000,%20%22v%22:%205},%20{%22d%22:%201464822000000,%20%22v%22:%2015}%20]&type=calendar.days)](https://bricks.redsift.cloud/reusable/d3-rs-squares.svg?_datum=[%20{%22d%22:%201462057200000,%20%22v%22:%2010},%20{%22d%22:%201462402800000,%20%22v%22:%205},%20{%22d%22:%201464822000000,%20%22v%22:%2015}%20]&type=calendar.days)<br>Examples: [Calendar Bricks](https://bricks.redsift.cloud/reusable/d3-rs-squares.svg?_datum=[%20{%22d%22:%201462057200000,%20%22v%22:%2010},%20{%22d%22:%201462402800000,%20%22v%22:%205},%20{%22d%22:%201464822000000,%20%22v%22:%2015}%20]&type=calendar.days) / [Matrix Bricks](https://bricks.redsift.cloud/reusable/d3-rs-squares.svg?_datum=[{%20%22x%22:%20%22jeff.dasovich%22,%22y%22:%20%22jeff.dasovich%22,%22z%22:%20491},{%20%22x%22:%20%22jeff.dasovich%22,%22y%22:%20%22lynn.blair%22,%22z%22:%200},{%20%22x%22:%20%22james.d.steffes%22,%20%22y%22:%20%22kay.mann%22,%22z%22:%200},{%20%22x%22:%20%22james.d.steffes%22,%20%22y%22:%20%22sally.beck%22,%22z%22:%2015}]&type=matrix.cooc) / [Matrix CodePen](http://codepen.io/geervesh/pen/ORrgjO) / [Calendar CodePen](http://codepen.io/geervesh/pen/ORydJV)
|`minDate`| `'calendar.days'` | *Timestamp* Override the earliest day of the dataset | Y| [![Preview of minDate](https://bricks.redsift.cloud/reusable/d3-rs-squares.svg?_datum=[{%22d%22:%201462057100000,%20%22v%22:%202},%20{%22d%22:%201462057200000,%20%22v%22:%2020},%20{%22d%22:%201462402800000,%20%22v%22:%205},%20{%22d%22:%201464822000000,%20%22v%22:%2015}]&nice=false&type=calendar.days&minDate=1462402800000)](https://bricks.redsift.cloud/reusable/d3-rs-squares.svg?_datum=[{%22d%22:%201462057100000,%20%22v%22:%202},%20{%22d%22:%201462057200000,%20%22v%22:%2020},%20{%22d%22:%201462402800000,%20%22v%22:%205},%20{%22d%22:%201464822000000,%20%22v%22:%2015}]&nice=false&type=calendar.days&minDate=1462402800000)<br> Examples: [Bricks](https://bricks.redsift.cloud/reusable/d3-rs-squares.svg?_datum=[{%22d%22:%201462057100000,%20%22v%22:%202},%20{%22d%22:%201462057200000,%20%22v%22:%2020},%20{%22d%22:%201462402800000,%20%22v%22:%205},%20{%22d%22:%201464822000000,%20%22v%22:%2015}]&nice=false&type=calendar.days&minDate=1462402800000) / [CodePen](http://codepen.io/geervesh/pen/WGAExB)
|`maxDate`| `'calendar.days'` | *Timestamp* Override the latest day of the dataset | Y | [![Preview of minDate](https://bricks.redsift.cloud/reusable/d3-rs-squares.svg?_datum=[{%22d%22:%201462057100000,%20%22v%22:%202},%20{%22d%22:%201462057200000,%20%22v%22:%2020},%20{%22d%22:%201462402800000,%20%22v%22:%205},%20{%22d%22:%201464822000000,%20%22v%22:%2015}]&nice=false&type=calendar.days&maxDate=1462057200000)](https://bricks.redsift.cloud/reusable/d3-rs-squares.svg?_datum=[{%22d%22:%201462057100000,%20%22v%22:%202},%20{%22d%22:%201462057200000,%20%22v%22:%2020},%20{%22d%22:%201462402800000,%20%22v%22:%205},%20{%22d%22:%201464822000000,%20%22v%22:%2015}]&nice=false&type=calendar.days&maxDate=1462057200000)<br> Examples: [Bricks](https://bricks.redsift.cloud/reusable/d3-rs-squares.svg?_datum=[{%22d%22:%201462057100000,%20%22v%22:%202},%20{%22d%22:%201462057200000,%20%22v%22:%2020},%20{%22d%22:%201462402800000,%20%22v%22:%205},%20{%22d%22:%201464822000000,%20%22v%22:%2015}]&nice=false&type=calendar.days&maxDate=1462057200000) / [CodePen](http://codepen.io/geervesh/pen/WGAExB)
|`nice` | `'calendar.days'`  | *Boolean* (deault: yes) Extend range of calendar to display whole months | N | Example: [CodePen](http://codepen.io/geervesh/pen/NRxydA)
|`monthSeparation` | `'calendar.days'`| *Boolean* (deault: yes) Add extra space between months| N | [![Preview of monthSeparation](https://bricks.redsift.cloud/reusable/d3-rs-squares.svg?_datum=[{%22d%22:%20978307200000,%22v%22:%208},%20{%22d%22:%20980985600000,%22v%22:%208219},%20{%22d%22:%20983404800000,%22v%22:%2010686}]&nice=false&type=calendar.days&monthSeparation=false)](https://bricks.redsift.cloud/reusable/d3-rs-squares.svg?_datum=[{%22d%22:%20978307200000,%22v%22:%208},%20{%22d%22:%20980985600000,%22v%22:%208219},%20{%22d%22:%20983404800000,%22v%22:%2010686}]&nice=false&type=calendar.days&monthSeparation=false)<br>Examples: [Bricks](https://bricks.redsift.cloud/reusable/d3-rs-squares.svg?_datum=[{%22d%22:%20978307200000,%22v%22:%208},%20{%22d%22:%20980985600000,%22v%22:%208219},%20{%22d%22:%20983404800000,%22v%22:%2010686}]&nice=false&type=calendar.days&monthSeparation=false) / [CodePen](http://codepen.io/geervesh/pen/yaZjgy)  
|`starting`| calendar.* | *String* First day of the week. Default is `'timeSunday'` Available options: (`'timeMonday'`, `'timeTuesday'`, ...) or the utc counterparts: (`'utcMonday'`, `'utcTuesday'`, ...) based on the [d3-time](https://github.com/d3/d3-time) package| | [![Preview of Starting](https://bricks.redsift.cloud/reusable/d3-rs-squares.svg?_datum=[{%22d%22:%20978307200000,%22v%22:%208},%20{%22d%22:%20980985600000,%22v%22:%208219},%20{%22d%22:%20983404800000,%22v%22:%2010686}]&nice=false&type=calendar.days&starting=utcMonday)](https://bricks.redsift.cloud/reusable/d3-rs-squares.svg?_datum=[{%22d%22:%20978307200000,%22v%22:%208},%20{%22d%22:%20980985600000,%22v%22:%208219},%20{%22d%22:%20983404800000,%22v%22:%2010686}]&nice=false&type=calendar.days&starting=utcMonday)<br>Examples: [Bricks](https://bricks.redsift.cloud/reusable/d3-rs-squares.svg?_datum=[{%22d%22:%20978307200000,%22v%22:%208},%20{%22d%22:%20980985600000,%22v%22:%208219},%20{%22d%22:%20983404800000,%22v%22:%2010686}]&nice=false&type=calendar.days&starting=utcMonday) / [CodePen](http://codepen.io/geervesh/pen/JRGkWm)
|`rangeIndex`, `rangeValue`| matrix | *String, Function, Array* ranges from [d3-time#ranges](https://github.com/d3/d3-time#ranges) (Milliseconds not supported) Custom ranges need to follow the [d3-time#range](https://github.com/d3/d3-time#interval_range) paradigm. If an array is supplied first expected element is the range function and second a cardinality override of the range unit e.g. `[d3.timeYear, 2]` for a range of 2 years | | [![Preview of Index & Value Range](https://bricks.redsift.cloud/reusable/d3-rs-squares.svg?_datum=[{%22x%22:%20993999486000,%20%22y%22:993999486000%20,%20%22z%22:8},%20{%22x%22:%20996677886000,%20%22y%22:996677886000,%20%22z%22:17},%20{%22x%22:%201000553960000,%20%22y%22:996677886000,%20%22z%22:%2050}]&rangeIndex=timeYear&intervalIndex=timeMonth&rangeValue=timeWeek&intervalValue=timeDay&tickAxisFormatValue=%25a%0D%0A&tickAxisFormatIndex=%25b)](https://bricks.redsift.cloud/reusable/d3-rs-squares.svg?_datum=[{%22x%22:%20993999486000,%20%22y%22:993999486000%20,%20%22z%22:8},%20{%22x%22:%20996677886000,%20%22y%22:996677886000,%20%22z%22:17},%20{%22x%22:%201000553960000,%20%22y%22:996677886000,%20%22z%22:%2050}]&rangeIndex=timeYear&intervalIndex=timeMonth&rangeValue=timeWeek&intervalValue=timeDay&tickAxisFormatValue=%25a%0D%0A&tickAxisFormatIndex=%25b)<br>Examples: [Bricks](https://bricks.redsift.cloud/reusable/d3-rs-squares.svg?_datum=[{%22x%22:%20993999486000,%20%22y%22:993999486000%20,%20%22z%22:8},%20{%22x%22:%20996677886000,%20%22y%22:996677886000,%20%22z%22:17},%20{%22x%22:%201000553960000,%20%22y%22:996677886000,%20%22z%22:%2050}]&rangeIndex=timeYear&intervalIndex=timeMonth&rangeValue=timeWeek&intervalValue=timeDay&tickAxisFormatValue=%25a%0D%0A&tickAxisFormatIndex=%25b) / [CodePen](http://codepen.io/geervesh/pen/YGqKao)
|`intervalIndex`, `intervalValue`| matrix | *String, Array* intervals from [d3-time#intervals](https://github.com/d3/d3-time#intervals) (Milliseconds not supported). For custom intervals an array is expected with the interval and range functions following the paradigm in [d3-time](https://github.com/d3/d3-time) e.g. `[timeHour, timeHours]` | | [![Preview of Index and Value intervals](https://bricks.redsift.cloud/reusable/d3-rs-squares.svg?_datum=[{%22x%22:%20993999486000,%20%22y%22:993999486000%20,%20%22z%22:8},%20{%22x%22:%20996677886000,%20%22y%22:996677886000,%20%22z%22:17},%20{%22x%22:%201000553960000,%20%22y%22:996677886000,%20%22z%22:%2050}]&rangeIndex=timeYear&intervalIndex=timeWeek&rangeValue=timeWeek&intervalValue=timeDay&tickAxisFormatIndex=%25U&tickAxisFormatValue=%25a)](https://bricks.redsift.cloud/reusable/d3-rs-squares.svg?_datum=[{%22x%22:%20993999486000,%20%22y%22:993999486000%20,%20%22z%22:8},%20{%22x%22:%20996677886000,%20%22y%22:996677886000,%20%22z%22:17},%20{%22x%22:%201000553960000,%20%22y%22:996677886000,%20%22z%22:%2050}]&rangeIndex=timeYear&intervalIndex=timeWeek&rangeValue=timeWeek&intervalValue=timeDay&tickAxisFormatIndex=%25U&tickAxisFormatValue=%25a)<br>Examples: [Bricks](https://bricks.redsift.cloud/reusable/d3-rs-squares.svg?_datum=[{%22x%22:%20993999486000,%20%22y%22:993999486000%20,%20%22z%22:8},%20{%22x%22:%20996677886000,%20%22y%22:996677886000,%20%22z%22:17},%20{%22x%22:%201000553960000,%20%22y%22:996677886000,%20%22z%22:%2050}]&rangeIndex=timeYear&intervalIndex=timeWeek&rangeValue=timeWeek&intervalValue=timeDay&tickAxisFormatIndex=%25U&tickAxisFormatValue=%25a) / [CodePen](http://codepen.io/geervesh/pen/YGqKao) 
|`onClick`| |*Function* handler for a click event on the data series| |



\* In the default orientation *\*Index* and *\*Value* apply respectively to the the *x* and *y* axis 
