// Sample weather and wave data for Barcelona
const weatherData = [
    { date: '2023-10-01', temperature: 22, waveHeight: 1.2, wavePeriod: 6, waveDirection: 45 },
    { date: '2023-10-02', temperature: 24, waveHeight: 1.5, wavePeriod: 5, waveDirection: 90 },
    { date: '2023-10-03', temperature: 21, waveHeight: 1.8, wavePeriod: 7, waveDirection: 135 },
    { date: '2023-10-04', temperature: 19, waveHeight: 1.0, wavePeriod: 6, waveDirection: 180 },
    { date: '2023-10-05', temperature: 23, waveHeight: 1.3, wavePeriod: 8, waveDirection: 225 },
    { date: '2023-10-06', temperature: 25, waveHeight: 1.7, wavePeriod: 4, waveDirection: 270 },
    { date: '2023-10-07', temperature: 20, waveHeight: 1.6, wavePeriod: 6, waveDirection: 315 }
];

const margin = { top: 20, right: 30, bottom: 40, left: 40 };
const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Parse the date / time
const parseDate = d3.timeParse("%Y-%m-%d");
weatherData.forEach(d => {
    d.date = parseDate(d.date);
});

const x = d3.scaleTime()
    .domain(d3.extent(weatherData, d => d.date))
    .range([0, width]);

const y = d3.scaleLinear()
    .domain([0, d3.max(weatherData, d => d.waveHeight)])
    .nice()
    .range([height, 0]);

const color = d3.scaleSequential(d3.interpolateRainbow)
    .domain([0, 360]);

const radius = d3.scaleSqrt()
    .domain(d3.extent(weatherData, d => d.wavePeriod))
    .range([4, 15]);

svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(d3.timeDay.every(1)).tickFormat(d3.timeFormat("%b %d")));

svg.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(y));

// Tooltip setup
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Line chart setup
const line = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.waveHeight));

svg.append("path")
    .datum(weatherData)
    .attr("class", "line")
    .attr("d", line)
    .attr("fill", "none")
    .attr("stroke", "orange")
    .attr("stroke-width", 2);

// Add circles for each data point
svg.selectAll(".dot")
    .data(weatherData)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", d => x(d.date))
    .attr("cy", d => y(d.waveHeight))
    .attr("r", d => radius(d.wavePeriod))
    .attr("fill", d => color(d.waveDirection))
    .on("mouseover", function(event, d) {
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        tooltip.html(`Date: ${d3.timeFormat("%Y-%m-%d")(d.date)}<br>Temp: ${d.temperature}°C<br>Wave Height: ${d.waveHeight}m<br>Wave Period: ${d.wavePeriod}s<br>Wave Direction: ${d.waveDirection}°`)
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    });

// Add arrows for wave direction
const arrowLength = 20;

svg.selectAll(".arrow")
    .data(weatherData)
    .enter()
    .append("line")
    .attr("class", "arrow")
    .attr("x1", d => x(d.date))
    .attr("y1", d => y(d.waveHeight))
    .attr("x2", d => x(d.date) + arrowLength * Math.cos((d.waveDirection - 90) * (Math.PI / 180)))
    .attr("y2", d => y(d.waveHeight) + arrowLength * Math.sin((d.waveDirection - 90) * (Math.PI / 180)))
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .attr("marker-end", "url(#arrowhead)");

// Define arrowhead marker
svg.append("defs").append("marker")
    .attr("id", "arrowhead")
    .attr("viewBox", "0 0 10 10")
    .attr("refX", 5)
    .attr("refY", 5)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto-start-reverse")
    .append("path")
    .attr("d", "M 0 0 L 10 5 L 0 10 z")
    .attr("fill", "black");