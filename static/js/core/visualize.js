//for each meta_series
//grab the percent passing and add it to the top
//add each other series to its graph

var months = ["January", "February", "March", "April", "May", "June", "July", "August",
  "September", "October", "November", "December"];
var $container = $('#container-p');
var $content = $('#visualize-content');
var $indicatorChart = $(".indicator-chart");
var currentDimension = null;
var noDimensions = "-1";

orchid_vis = {
  locations: [],
  location_cursor: null,
  month: months,
  get_chart_by_id: function (id) {
    var index = $("#container-" + id).data('highchartsChart');
    return Highcharts.charts[index];
  },
  clearCharts: function () {
    $indicatorChart.each(function () {
      orchid_vis.clearChart($(this));
    });
  },
  clearChart: function ($el) {
    try {
      $el.highcharts().destroy();
    } catch (e) {
      console.log(e);
    }
    orchid_vis.apply_chart($el, [], $el.data("indicator-title"), true);
  },
  apply_chart: function (dom_object, series_data_blob, chart_title, legend_enabled) {
    return dom_object.highcharts({
      chart: {
        type: 'spline'
      },
      title: {
        text: chart_title
      },
      subtitle: {
        text: 'Click legend to select lines.'
      },
      exporting: {
        sourceWidth: 1024,
        sourceHeight: 786
      },
      xAxis: {
        type: 'datetime',
        tickInterval: 30 * 24 * 3600 * 1000,
        dateTimeLabelFormats: { // don't display the dummy year
          month: '%e. %b',
          year: '%b'
        },
        title: {
          text: 'Date'
        }
      },
      yAxis: {
        title: {
          text: 'Score (%)'
        },
        min: 0,
        max: 100
      },
      legend: {
        enabled: legend_enabled
      },
      tooltip: {
        headerFormat: '<b>{series.name}</b><br>',
        pointFormat: '{point.x: %b %Y}: {point.y:.2f}%'
      },
      series: series_data_blob
    });

  },
  load_next_location: function () {
    if (orchid_vis.location_cursor == null) {
      orchid_vis.location_cursor = 0;
    }
    else {
      //update the cursor
      orchid_vis.location_cursor += 1;
    }
    if (orchid_vis.location_cursor < orchid_vis.locations.length) {
      var next_location_id = orchid_vis.locations[orchid_vis.location_cursor].id;
      //load the location's json
      var url = "location/" + String(next_location_id) + "/visualize";
      $.getJSON(url, {dimension: currentDimension}, function (data) {
        for (var q in data.series) {
          var s = data.series[q];
          if (s.id != undefined) {
            var loading_chart = orchid_vis.get_chart_by_id(s.id);
            //adjust dates in data
            newData = [];
            for (var d in s.data) {
              this_data = s.data[d];
              newData.push([
                new Date(this_data[0]).getTime(),
                parseInt(this_data[1]),
                this_data[2],
                this_data[3]
              ]);
            }
            var title = "";
            if (data.noun) {
              title = data.noun.title;
            }
            loading_chart.addSeries({
              name: title,
              data: newData
            });
          }
        }
        var txt = String(orchid_vis.location_cursor + 1) + "/" +
          String(orchid_vis.locations.length) + " Loaded";
        $('#loaded_counter').html(txt);
        orchid_vis.load_next_location();
      });
    }

  }
};

$('#dimensions').on('change', function (e) {
  var $this = $(this);
  var value = $this.val();
  if (value == noDimensions) {
    $content.hide();
  } else {
    $content.show();
    currentDimension = value;
    drawLocationsByDimension(currentDimension);
  }
});

function drawLocationsByDimension(dimension) {
  orchid_vis.locations = [];
  orchid_vis.location_cursor = null;
  orchid_vis.clearCharts();

  $.getJSON("location/list/plain", {dimension: dimension}, function (data) {
    // is still the same dimension?
    if (dimension == currentDimension) {
      $.each(data.locations, function (key, val) {
        orchid_vis.locations.push(val);
      });
      $('#loaded_counter').html("0/" + String(orchid_vis.locations.length) + " Loaded");
      orchid_vis.load_next_location();
    }
  });
}


// I do not what this does
orchid_vis.apply_chart($container, [], "Percent Of Goals Met", true);
var index = $container.data('highchartsChart');
var mychart = Highcharts.charts[index];

mychart.setTitle("hello!");

$indicatorChart.each(function () {
  orchid_vis.apply_chart($(this), [], $(this).data("indicator-title"), true);
});
