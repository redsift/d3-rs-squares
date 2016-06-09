# d3-rs-calendar-chart

`d3-rs-calendar-chart` easily generate a single character icon.

## Builds

[![Circle CI](https://circleci.com/gh/Redsift/d3-rs-calendar-chart.svg?style=svg)](https://circleci.com/gh/Redsift/d3-rs-calendar-chart)

## Example

[View @redsift/d3-rs-calendar-chart on Codepen](https://....)

## Usage

### Browser
	
	<script src="//static.redsift.io/reusable/d3-rs-calendar-chart/latest/d3-rs-calendar-chart.umd-es2015.min.js"></script>
	<script>
		var chart = d3_rs_calendar_chart.html().lastWeeks(12);
		...
	</script>

### ES6

	import { chart } from "@redsift/d3-rs-calendar-chart";
	let eml = chart.html();
	...
	
### Require

	var chart = require("@redsift/d3-rs-calendar-chart");
	var eml = chart.html();
	...

### Parameters

|Name|Description|Transition|
|----|-----------|----------|
|classed|SVG custom class|N|
|width| Width of the calendar| Y|
|height| Height of the calendar| Y|
|lastWeeks| Number of weeks in the past from now| Y|
|colours| Colour palette for the data. Expected values `green\|blue\|purple`, or an array of RGB values e.g. `['#b0e288', ... ]` preferably length >= 5 | Y|
