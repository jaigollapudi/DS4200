// Name: Jai Gollapudi 
// Class: DS4200 
// Assignment: HW3 

// Defining global variables for the dimensions and margins 
const margin = { top: 10, right: 30, bottom: 80, left: 60 };
const height = 400; 
const width = 860 - margin.left - margin.right;

// Loading the data
const penguins = d3.csv("penguins.csv");

// SCATTERPLOT //

// Loading the data and creating the scatter plot
penguins.then(function(data) {
    // Converting string values to numbers
    data.forEach(function(d) {
        d.bill_length_mm = +d.bill_length_mm;
        d.flipper_length_mm = +d.flipper_length_mm;
    });

    // Selecting the SVG container for the scatterplot
    const svg = d3.select("#scatterplot")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    // Appending a 'g' element to the existing SVG container
    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Setting up scales for scatter plot axes
    const xScatter = d3.scaleLinear()
        .domain([d3.min(data, d => d.bill_length_mm) - 5, d3.max(data, d => d.bill_length_mm) + 5])
        .range([0, width]);
    const yScatter = d3.scaleLinear()
        .domain([d3.min(data, d => d.flipper_length_mm) - 5, d3.max(data, d => d.flipper_length_mm) + 5])
        .range([height, 0]);

    // Color scale
    const colorScale = d3.scaleOrdinal()
        .domain(data.map(d => d.species))
        .range(d3.schemeCategory10);

    // Adding circles for scatter plot
    g.selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScatter(d.bill_length_mm))
        .attr("cy", d => yScatter(d.flipper_length_mm))
        .attr("r", 5)
        .style("fill", d => colorScale(d.species));

    // Adding scatter plot axes
    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScatter));
    g.append("g")
        .call(d3.axisLeft(yScatter));

    // Adding scatter plot axis labels
    g.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.top + 40})`)
        .style("text-anchor", "middle")
        .style("font-size", "18px")
        .text("Bill Length (mm)");
    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", "18px")
        .text("Flipper Length (mm)");

    // Adding legend with circles as indicators
    const legend = g.selectAll(".legend")
        .data(colorScale.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(0,${i * 20})`);
    
    legend.append("circle")
        .attr("cx", width - 10) 
        .attr("cy", 9) 
        .attr("r", 9) 
        .style("fill", colorScale);
    
    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(d => d);
});

// BOXPLOT 
// Loading the data and creating the box plot
penguins.then(function(data) {
    // Converting string values to numbers
    data.forEach(function(d) {
        d.flipper_length_mm = +d.flipper_length_mm;
    });

    // Creating the SVG container for the boxplot
    const svg = d3.select("#boxplot")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    // Appending a 'g' element to the existing SVG container
    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Setting up scales for boxplot
    const species = [...new Set(data.map(d => d.species))];
    const xBoxplot = d3.scaleBand()
        .domain(species)
        .range([0, width])
        .padding(0.2);
    const yBoxplot = d3.scaleLinear()
        .domain([d3.min(data, d => d.flipper_length_mm) - 5, d3.max(data, d => d.flipper_length_mm) + 5])
        .range([height, 0]);

    // Defining rollup function for boxplot
    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.flipper_length_mm).sort(d3.ascending);
        const q1 = d3.quantile(values, .25);
        const median = d3.quantile(values, .5);
        const q3 = d3.quantile(values, .75);
        const iqr = q3 - q1; // Interquartile range
        return { q1, median, q3, iqr };
    };

    // Using d3.rollup to group the data by species and calculate quartiles, median for each group
    const quartilesBySpecies = d3.rollup(data, rollupFunction, d => d.species);

    // Iterating over each species and its calculated quartiles to draw the box plots
    quartilesBySpecies.forEach((quartiles, species) => {
        // Calculating the x position for the box plot of the current species
        const x = xBoxplot(species);
        // Determining the width of each box in the box plot
        const boxWidth = xBoxplot.bandwidth();

        // Drawing vertical lines
        g.append("line")
            .attr("x1", x + boxWidth / 2)
            .attr("x2", x + boxWidth / 2)
            .attr("y1", yBoxplot(quartiles.q1 - 1.5 * quartiles.iqr))
            .attr("y2", yBoxplot(quartiles.q3 + 1.5 * quartiles.iqr))
            .attr("stroke", "black");

        // Drawing box
        g.append("rect")
            .attr("x", x)
            .attr("y", yBoxplot(quartiles.q3))
            .attr("height", yBoxplot(quartiles.q1) - yBoxplot(quartiles.q3))
            .attr("width", boxWidth)
            .attr("stroke", "black")
            .style("fill", "lightgrey");

        // Drawing median line
        g.append("line")
            .attr("x1", x)
            .attr("x2", x + boxWidth)
            .attr("y1", yBoxplot(quartiles.median))
            .attr("y2", yBoxplot(quartiles.median))
            .attr("stroke", "black");
    });

    // Adding boxplot axis and label
    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xBoxplot));
    g.append("g")
        .call(d3.axisLeft(yBoxplot));
    g.append("text")             
        .attr("transform", `translate(${width/2}, ${height + margin.top + 40})`)
        .style("text-anchor", "middle")
        .style("font-size", "18px")
        .text("Species");
    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Flipper Length (mm)")
        .style("font-size", "18px");
});