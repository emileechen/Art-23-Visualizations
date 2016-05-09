var margin = { top: 50, right: 0, bottom: 75, left: 40 },
  weekdays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
  hours = ["1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12a", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p", "12p"],
  width = 960 - margin.left - margin.right,
  height = 425 - margin.top - margin.bottom,
  gridSize = Math.floor(width / hours.length),
  legendElementWidth = gridSize*2,
  buckets = 5,
  colors = colorbrewer.BuPu[buckets],
  datasets = ["data/add_asset.csv", "data/asset_comment.csv", "data/discussion_entry.csv", "data/get_asset_comment_reply.csv", "data/get_asset_comment.csv", "data/get_like.csv", "data/like.csv", "data/submit_assignment.csv"],
  datanames = ["Add Asset", "Asset Comment", "Discussion Entry", "Get Asset Comment Reply", "Get Asset Commnet", "Get Like", "Like", "Submit Assignment"];

var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var weekdayLabels = svg.selectAll(".weekdayLabel")
    .data(weekdays)
    .enter().append("text")
      .text(function (w) { return w; })
      .attr("x", 0)
      .attr("y", function (w, i) { return i * gridSize; })
      .style("text-anchor", "end")
      .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
      .attr("class", function(d, i) { return ((i >= 0 && i <= 4) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });

var timeLabels = svg.selectAll(".hourLabel")
    .data(hours)
    .enter().append("text")
      .text(function(h) { return h; })
      .attr("x", function(h, i) { return i * gridSize; })
      .attr("y", 0)
      .style("text-anchor", "middle")
      .attr("transform", "translate(" + gridSize / 2 + ", -6)")
      .attr("class", function(d, i) { return ((i >= 8 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });

function collate(data) {
  to_rtn = [];
  for (w = 0; w < weekdays.length; w++) {
    for (t = 0; t < hours.length; t++) {
      to_rtn.push({ hour: t,
                      weekday: w,
                      value: 0  });
    }
  }
  for (d = 0; d < data.length; d++) {
    var heh = to_rtn[data[d].weekday * hours.length + data[d].hour];
    heh.value = heh.value + data[d].value;
  }
  return to_rtn;
}


var heatmapChart = function(filename) {
  d3.csv(filename,
  function(d) {
    return {
      weekday: +d.weekday,
      month: +d.month,
      day: +d.day,
      hour: +d.hour,
      value: +d.score
    };
  },
  function(error, data) {
    data = collate(data);

    var colorScale = d3.scale.quantile()
        .domain([0, buckets - 1, d3.max(data, function (d) { return d.value; })])
        .range(colors);

    var cards = svg.selectAll(".hour")
        // .data(data, function(d) {return d.day+':'+d.hour;});
        // .data(data, function(d) {return d.month+':'+d.hour;});
        .data(data, function(d) {return d.weekday+':'+d.hour;});

    cards.append("title");

    cards.enter().append("rect")
        .attr("x", function(d) { return (d.hour) * gridSize; })
        .attr("y", function(d) { return (d.weekday) * gridSize; })
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("class", "hour bordered")
        .attr("width", gridSize)
        .attr("height", gridSize)
        .style("fill", colors[0]);

    cards.transition().duration(1000)
        .style("fill", function(d) { return colorScale(d.value); });

    cards.select("title").text(function(d) { return d.value; });
    
    cards.exit().remove();

    var legend = svg.selectAll(".legend")
        .data([0].concat(colorScale.quantiles()), function(d) { return d; });

    legend.enter().append("g")
        .attr("class", "legend");

    legend.append("rect")
      .attr("x", function(d, i) { return legendElementWidth * i; })
      .attr("y", height)
      .attr("width", legendElementWidth)
      .attr("height", gridSize / 2)
      .style("fill", function(d, i) { return colors[i]; });

    legend.append("text")
      .attr("class", "mono")
      .text(function(d) { return "\u2265 " + Math.round(d); })
      .attr("x", function(d, i) { return legendElementWidth * i; })
      .attr("y", height + gridSize);

    legend.exit().remove();

  }); 
};

heatmapChart(datasets[5]);

var datasetpicker = d3.select("#dataset-picker").selectAll(".dataset-button")
  .data(datasets);

var subtitle = d3.select("#subtitle");

datasetpicker.enter()
  .append("input")
  .attr("value", function(d) { return datanames[datasets.indexOf(d)]; })
  .attr("type", "button")
  .attr("class", "dataset-button")
  .on("click", function(d) {
    heatmapChart(d);
    subtitle[0][0].innerHTML = "Currently Visualizing: " + datanames[datasets.indexOf(d)];
  });




