//http://bl.ocks.org/PBrockmann/0f22818096428b12ea23
var skKey = config.SK_API;

var bleed = 100,
    width = 900,
    height = 900,
    radius = Math.min(width, height) / 2;

var x = d3.scale.linear()
    .range([0, 2 * Math.PI]);

var y = d3.scale.linear()
    .range([0, radius]);

// Define the div for the tooltip
var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var color = d3.scale.linear().domain([1,60])
      .interpolate(d3.interpolateHcl)
      .range([d3.rgb('#f1e383'), d3.rgb('#ebaa6f'), d3.rgb('#df585e'), d3.rgb('#d76f91'), d3.rgb('#984173'), d3.rgb('#2e2d4b')]);

var svg = d3.select("#graph").append("svg")
    .attr("class", "burst")
    .attr("width", width)
    .attr("height", height)
    //.attr("preserveAspectRatio", "xMinYMin meet")
    //.attr("viewBox", "0 0 600 600")
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + (height / 2 + 0) + ")");

    var aspect = width / height;

    d3.select(window)
      .on("resize", function() {
        var targetWidth = svg.node().getBoundingClientRect().width;
        svg.attr("width", targetWidth);
        svg.attr("height", targetWidth / aspect);
      });

var partition = d3.layout.partition()
    .value(function(d) { return d.size; });

var arc = d3.svg.arc()
    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
    .innerRadius(function(d) { return Math.max(0, y(d.y)); })
    .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });

////assets.crowdsurge.com/demos/yi/coachella/coachella2.json?v2
d3.json("coachella2.json?v5", function(error, root) {
  var g = svg.selectAll("g")
      .data(partition.nodes(root))
    .enter().append("g");

  var path = g.append("path")
    .attr("d", arc)
    .attr("class", function(d){return d.show + " " + d.name;})
    .attr("stroke","#2e2d4b")
    .attr("stroke-width",".5")
    .style("fill", function(d) { return color((d.children ? d : d.parent).size); })
    .on("click", function(d){
      click(d);
      if(d.artistid){
        $('#artistInfo .title').html(d.name);
        $('#query').attr("value", d.name + ' coachella live');
        searchIn();
        $.getJSON("http://api.songkick.com/api/3.0/search/artists.json?query="+d.name+"&apikey="+skKey+"&jsoncallback=?",
        function(data){

          if(data.resultsPage.results != 0){
            var artistid = data.resultsPage.results.artist[0].id;
          }
          else{
            console.log("no");
          }

          $('#artistInfo .imgHolder').html('<img src="https://images.sk-static.com/images/media/profile_images/artists/' + artistid + '/large_avatar" class="item-image" alt="' + d.name + '">');
          $('#artistInfo .btnHolder').html('<a href="https://accounts.songkick.com/artists/' + artistid + '/trackings/signup" target="_blank" class="action_button trackBtn"><span class="a"></span><span class="b">Track ' + d.name + '</span></a>');

          $('#artistInfo').fadeIn();

        });
      }
      else{
        console.log("artist does not exist");
        //click(d);
      }
      console.log("clicks");
    })
    .on("mouseover", function(d) {
      if($(this).is( ".undefined" )){
        div.transition().duration(200).style("opacity", 0.9);
        div.html("<h1>"+d.name+"</h1><p>" + d.parent.name + "</p><span>" + d.parent.parent.name + " | " + root.name + "</span>")
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY) + "px");
        }
        else{
          //null
        }
      })
        .on("mouseout", function(d) {
          div.transition()
            .duration(500)
            .style("opacity", 0);
    });

  var text = g.append("text")
    .attr("transform", function(d) { return "rotate(" + computeTextRotation(d) + ")"; })
    .attr("x", function(d) { return y(d.y); })
    .attr("dx", "6") // margin
    .attr("dy", ".35em") // vertical-align
    .attr("class", function(d){return d.show + " " + d.name;})
    .text(function(d) { return d.name; });

  function click(d) {
    // fade out all text elements
    text.transition().attr("opacity", 0);

    path.transition()
      .duration(750)
      .attrTween("d", arcTween(d))
      .each("end", function(e, i) {
          // check if the animated element's data e lies within the visible angle span given in d
          if (e.x >= d.x && e.x < (d.x + d.dx)) {
            // get a selection of the associated text element
            var arcText = d3.select(this.parentNode).select("text");
            // fade in the text element and recalculate positions
            arcText.transition().duration(750)
              .attr("opacity", 1)
              .attr("style","display:inline")
              .attr("transform", function() { return "rotate(" + computeTextRotation(e) + ")";})
              .attr("x", function(d) { return y(d.y); });

             //console.log(d.x);
          }
          if (d.x == 0) {
            var arcText = d3.select(this.parentNode).select("text.undefined");
            arcText.transition().duration(750)
            .attr("style","display:none");
          }
      });
  }
});

d3.select(self.frameElement).style("height", height + "px");

// Interpolate the scales!
function arcTween(d) {
  var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
      yd = d3.interpolate(y.domain(), [d.y, 1]),
      yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
  return function(d, i) {
    return i
        ? function(t) { return arc(d); }
        : function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
  };
}

function computeTextRotation(d) {
  return (x(d.x + d.dx / 2) - Math.PI / 2) / Math.PI * 180;
}

$('.backBtn').click(function(){
  $('#artistInfo').fadeOut();
  $('.ytEmbed').remove();
});