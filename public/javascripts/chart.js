function Chart(json){
	
	var data = [];
	
	for(i=-180; i<=180; i+=20){
		data.push([i,0,0]);
	}
	
	for(i=0; i<json.length; i++){
		if(json[i].value.coordinate){
			var sentiment = json[i].sentiment.value;
			var longitude = (json[i].value.coordinate.coordinates[0]/20).toFixed()*20;
			
			var longitudeIndex = (longitude/20)+9;
			data[longitudeIndex][1] += sentiment;
			data[longitudeIndex][2]++;
		}
	}
	
	for(i=0;i<data.length;i++){
		data[i] = [data[i][0], data[i][1]/data[i][2]];
	}
	
	d3.select("#visualisation")
	  .datum(data)
	    .call(columnChart()
	      .width(960)
	      .height(500)
	      .x(function(d, i) { return d[0]; })
	      .y(function(d, i) { return d[1]; })
	    );
      
	function columnChart() {
	  var margin = {top: 30, right: 10, bottom: 50, left: 50},
	      width = 420,
	      height = 420,
	      xRoundBands = 0.2,
	      xValue = function(d) { return d[0]; },
	      yValue = function(d) { return d[1]; },
	      xScale = d3.scale.ordinal(),
	      yScale = d3.scale.linear(),
	      yAxis = d3.svg.axis().scale(yScale).orient("left"),
	      xAxis = d3.svg.axis().scale(xScale);
	      
	
	  function chart(selection) {
	    selection.each(function(data) {
	
	      // Convert data to standard representation greedily;
	      // this is needed for nondeterministic accessors.
	      data = data.map(function(d, i) {
	        return [xValue.call(data, d, i), yValue.call(data, d, i)];
	      });
	    
	      // Update the x-scale.
	      xScale
	          .domain(data.map(function(d) { return d[0];} ))
	          .rangeRoundBands([0, width - margin.left - margin.right], xRoundBands);
	         
	
	      // Update the y-scale.
	      yScale
	          .domain(d3.extent(data.map(function(d) { return d[1];} )))
	          .range([height - margin.top - margin.bottom, 0])
	          .nice();
	          
	
	      // Select the svg element, if it exists.
	      var svg = d3.select(this).selectAll("svg").data([data]);
	
	      // Otherwise, create the skeletal chart.
	      var gEnter = svg.enter().append("svg").append("g");
	      gEnter.append("g").attr("class", "bars");
	      gEnter.append("g").attr("class", "y axis");
	      gEnter.append("g").attr("class", "x axis");
	      gEnter.append("g").attr("class", "x axis zero");
	
	      // Update the outer dimensions.
	      svg .attr("width", width)
	          .attr("height", height);
	
	      // Update the inner dimensions.
	      var g = svg.select("g")
	          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	     // Update the bars.
	      var bar = svg.select(".bars").selectAll(".bar").data(data);
	      bar.enter().append("rect");
	      bar.exit().remove();
	      bar .attr("class", function(d, i) { return d[1] < 0 ? "bar negative" : "bar positive"; })
	          .attr("x", function(d) { return X(d); })
	          .attr("y", function(d, i) { return d[1] < 0 ? Y0() : Y(d); })
	          .attr("width", xScale.rangeBand())
	          .attr("height", function(d, i) { return Math.abs( Y(d) - Y0() ); });
	
	    // x axis at the bottom of the chart
	     g.select(".x.axis")
	        .attr("transform", "translate(0," + (height - margin.top - margin.bottom) + ")")
	        .call(xAxis.orient("bottom"));
	    
	    // zero line
	     g.select(".x.axis.zero")
	        .attr("transform", "translate(0," + Y0() + ")")
	        .call(xAxis.tickFormat("").tickSize(0));
	    
	    
	      // Update the y-axis.
	      g.select(".y.axis")
	        .call(yAxis);
	          
	    });
	  }
	
	
	// The x-accessor for the path generator; xScale ∘ xValue.
	  function X(d) {
	    return xScale(d[0]);
	  }
	
	  function Y0() {
	    return yScale(0);
	  }
	
	  // The x-accessor for the path generator; yScale ∘ yValue.
	  function Y(d) {
	    return yScale(d[1]);
	  }
	
	  chart.margin = function(_) {
	    if (!arguments.length) return margin;
	    margin = _;
	    return chart;
	  };
	
	  chart.width = function(_) {
	    if (!arguments.length) return width;
	    width = _;
	    return chart;
	  };
	
	  chart.height = function(_) {
	    if (!arguments.length) return height;
	    height = _;
	    return chart;
	  };
	
	  chart.x = function(_) {
	    if (!arguments.length) return xValue;
	    xValue = _;
	    return chart;
	  };
	
	  chart.y = function(_) {
	    if (!arguments.length) return yValue;
	    yValue = _;
	    return chart;
	  };
	
	  return chart;
	}
}