// D3.js script to create the 3CC Framework Visualization

// Set dimensions and margins
const margin = { top: 50, right: 250, bottom: 50, left: 150 },
  width = 1000 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;

// Append SVG object to the page
const svg = d3
  .select("#grid-container")
  .append("svg")
  .attr("width", width + margin.left + margin.right + 150)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Define stakeholders and levels
const stakeholders = data.map((d) => d.stakeholder);
const levels = ["Cognitive Companions", "Cognitive Colleagues", "Cognitive Collectives"];

// Create scales
const x = d3.scaleBand().domain(levels).range([0, width]).padding(0.05);
const y = d3.scaleBand().domain(stakeholders).range([0, height]).padding(0.05);

// Add X axis
svg
  .append("g")
  .attr("transform", `translate(0,${height})`)
  .call(d3.axisBottom(x));

// Add Y axis
svg.append("g").call(d3.axisLeft(y));

// Flatten data for easy binding
const gridData = [];
data.forEach((stakeholderData) => {
  stakeholderData.levels.forEach((levelData) => {
    gridData.push({
      stakeholder: stakeholderData.stakeholder,
      level: levelData.level,
      similarWork: levelData.similarWork,
    });
  });
});

// Define color scale based on implementation status
const colorScale = d3
  .scaleOrdinal()
  .domain(["Widely adopted", "Growing adoption", "Emerging"])
  .range(["#4CAF50", "#FFC107", "#F44336"]);

// Define status icons
const statusIcons = {
  "Widely adopted": "✔️",
  "Growing adoption": "🔄",
  Emerging: "✨",
};

// Create cells
svg
  .selectAll()
  .data(gridData)
  .enter()
  .append("g") // Use a group element to contain both rect and text
  .attr("transform", (d) => `translate(${x(d.level)}, ${y(d.stakeholder)})`)
  .each(function (d) {
    const cellGroup = d3.select(this);

    // Append rectangle
    const cellColor = colorScale(d.similarWork[0].implementationStatus);
    cellGroup
      .append("rect")
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .attr("stroke", "black")
      .attr("fill", cellColor)
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut)
      .on("click", handleClick);

    // Append status icon
    const statusIcon = statusIcons[d.similarWork[0].implementationStatus];
    cellGroup
      .append("text")
      .attr("class", "cell-icon")
      .attr("x", 5)
      .attr("y", 15)
      .attr("text-anchor", "start")
      .attr("alignment-baseline", "hanging")
      .text(statusIcon);

    // Append names of similar works (one per line)
    const workNames = d.similarWork.map((work) => work.name);
    const maxLines = 4; // Maximum number of lines to display
    const displayNames = workNames.slice(0, maxLines);
    if (workNames.length > maxLines) {
      displayNames.push(`and ${workNames.length - maxLines} more`);
    }

    const textElement = cellGroup
      .append("text")
      .attr("class", "cell-text")
      .attr("x", x.bandwidth() / 2)
      .attr("y", y.bandwidth() / 2 - ((displayNames.length - 1) * 6))
      .attr("dy", 0);

    displayNames.forEach((name, index) => {
      textElement
        .append("tspan")
        .attr("x", x.bandwidth() / 2)
        .attr("dy", index === 0 ? 0 : 12)
        .text(name);
    });
  });

// Create a tooltip div
const tooltip = d3
  .select("body")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip");

// Mouseover event handler
function handleMouseOver(event, d) {
  tooltip.style("opacity", 1);
  tooltip
    .html(`<strong>${d.stakeholder} - ${d.level}</strong><br/>
           Click for more details.`)
    .style("left", event.pageX + 10 + "px")
    .style("top", event.pageY + 10 + "px");
  d3.select(this).select("rect").attr("stroke-width", 2);
}

// Mouseout event handler
function handleMouseOut(event, d) {
  tooltip.style("opacity", 0);
  d3.select(this).select("rect").attr("stroke-width", 1);
}

// Click event handler
function handleClick(event, d) {
  showModal(d);
}

// Function to display modal with detailed information
function showModal(d) {
  // Remove any existing modal
  d3.select(".modal").remove();

  // Get the cell's color
  const cellColor = colorScale(d.similarWork[0].implementationStatus);

  // Create modal elements
  const modal = d3
    .select("body")
    .append("div")
    .attr("class", "modal")
    .style("background-color", "rgba(0, 0, 0, 0.5)");

  const modalContent = modal
    .append("div")
    .attr("class", "modal-content")
    .style("background-color", cellColor)
    .style("color", "#fff"); // Adjust text color for contrast

  modalContent
    .append("span")
    .attr("class", "close-button")
    .html("&times;")
    .on("click", () => {
      modal.remove();
    });

  modalContent.append("h2").text(`${d.stakeholder} - ${d.level}`);

  // Add detailed information
  d.similarWork.forEach((work) => {
    const workDiv = modalContent.append("div").attr("class", "work-details");

    workDiv
      .append("h3")
      .html(`<a href="${work.link}" target="_blank">${work.name}</a>`);

    workDiv.append("p").html(`<strong>Benefits:</strong> ${work.benefits}`);
    workDiv.append("p").html(`<strong>Challenges:</strong> ${work.challenges}`);
    workDiv.append("p").html(`<strong>Technologies:</strong> ${work.technologies}`);
    workDiv.append("p").html(`<strong>Ethical Considerations:</strong> ${work.ethicalConsiderations}`);
    workDiv.append("p").html(`<strong>Implementation Status:</strong> ${work.implementationStatus}`);
    workDiv.append("p").html(`<strong>Impact:</strong> ${work.impact}`);
    workDiv.append("hr");
  });
}

// Add legend for color scale
const legend = svg
  .selectAll(".legend")
  .data(colorScale.domain())
  .enter()
  .append("g")
  .attr("class", "legend")
  .attr("transform", (d, i) => `translate(0, ${i * 20})`);

legend
  .append("rect")
  .attr("x", width + 20)
  .attr("width", 18)
  .attr("height", 18)
  .style("fill", colorScale);

legend
  .append("text")
  .attr("x", width + 45)
  .attr("y", 9)
  .attr("dy", ".35em")
  .attr("class", "legend-text")
  .text((d) => d);

// Add legend for status icons
const iconLegendData = [
  { status: "Widely adopted", icon: "✔️" },
  { status: "Growing adoption", icon: "🔄" },
  { status: "Emerging", icon: "✨" },
];

const iconLegend = svg
  .selectAll(".icon-legend")
  .data(iconLegendData)
  .enter()
  .append("g")
  .attr("class", "icon-legend")
  .attr(
    "transform",
    (d, i) =>
      `translate(0, ${colorScale.domain().length * 20 + i * 20 + 10})`
  );

iconLegend
  .append("text")
  .attr("x", width + 25)
  .attr("y", 9)
  .attr("dy", ".35em")
  .attr("class", "legend-icon")
  .text((d) => d.icon);

iconLegend
  .append("text")
  .attr("x", width + 45)
  .attr("y", 9)
  .attr("dy", ".35em")
  .attr("class", "legend-text")
  .text((d) => d.status);

