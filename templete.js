// Load the data
d3.csv("iris.csv").then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.PetalLength = +d.PetalLength;
        d.PetalWidth = +d.PetalWidth;
    });

    // Define larger dimensions and margins for the SVG
    const margin = { top: 30, right: 50, bottom: 60, left: 70 };
    const width = 700 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Create the SVG container for the scatter plot
    const svgScatter = d3.select("#scatterplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Set up scales for the scatter plot
    const xScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalLength) - 0.5, d3.max(data, d => d.PetalLength) + 0.5])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalWidth) - 0.5, d3.max(data, d => d.PetalWidth) + 0.5])
        .range([height, 0]);

    const colorScale = d3.scaleOrdinal()
        .domain(data.map(d => d.Species))
        .range(d3.schemeCategory10);

    // Add X-axis to scatter plot
    svgScatter.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale))
        .append("text")
        .attr("x", width / 2)
        .attr("y", margin.bottom - 20)
        .attr("fill", "black")
        .attr("font-size", "14px")
        .text("Petal Length");

    // Add Y-axis to scatter plot
    svgScatter.append("g")
        .call(d3.axisLeft(yScale))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 20)
        .attr("fill", "black")
        .attr("font-size", "14px")
        .text("Petal Width");

    // Add circles for each data point
    svgScatter.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.PetalLength))
        .attr("cy", d => yScale(d.PetalWidth))
        .attr("r", 5)
        .attr("fill", d => colorScale(d.Species));

    // Add legend to scatter plot
    const legend = svgScatter.selectAll(".legend")
        .data(colorScale.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => "translate(0," + i * 25 + ")");

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", colorScale);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(d => d);

    // Create the SVG container for the boxplot
    const svgBox = d3.select("#boxplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Set up scales for boxplot
    const xBoxScale = d3.scaleBand()
        .domain(data.map(d => d.Species))
        .range([0, width])
        .padding(0.1);

    const yBoxScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalLength) - 0.5, d3.max(data, d => d.PetalLength) + 0.5])
        .range([height, 0]);

    svgBox.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xBoxScale));

    svgBox.append("g")
        .call(d3.axisLeft(yBoxScale));

    // Define rollup function for boxplot
    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.PetalLength).sort(d3.ascending);
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        return { q1, median, q3 };
    };

    const quartilesBySpecies = d3.rollup(data, rollupFunction, d => d.Species);

    // Draw the boxplot
    quartilesBySpecies.forEach((quartiles, species) => {
        const x = xBoxScale(species);
        const boxWidth = xBoxScale.bandwidth();

        // Draw vertical lines for IQR
        svgBox.append("line")
            .attr("x1", x + boxWidth / 2)
            .attr("x2", x + boxWidth / 2)
            .attr("y1", yBoxScale(quartiles.q1 - 1.5 * (quartiles.q3 - quartiles.q1)))
            .attr("y2", yBoxScale(quartiles.q3 + 1.5 * (quartiles.q3 - quartiles.q1)))
            .attr("stroke", "black");

        // Draw the box
        svgBox.append("rect")
            .attr("x", x)
            .attr("y", yBoxScale(quartiles.q3))
            .attr("width", boxWidth)
            .attr("height", yBoxScale(quartiles.q1) - yBoxScale(quartiles.q3))
            .attr("fill", "#69b3a2");

        // Draw the median line
        svgBox.append("line")
            .attr("x1", x)
            .attr("x2", x + boxWidth)
            .attr("y1", yBoxScale(quartiles.median))
            .attr("y2", yBoxScale(quartiles.median))
            .attr("stroke", "black");
    });
});
