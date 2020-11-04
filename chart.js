let data = [];
let dims = { height: 350, width: 500, radius: 150 };
let center = { x: dims.width / 3 + 5, y: dims.width / 3 + 5 };

const svg = d3
    .select(".canvas")
    .append("svg")
    .attr("width", dims.width)
    .attr("height", dims.height);

const tip = d3.select(".canvas").append("div").attr("class", "d3-tip");

const chart = svg
    .append("g")
    .attr("transform", `translate(${center.x},${center.y})`);
const legendGroup = svg
    .append("g")
    .attr("transform", `translate(${dims.width - dims.radius + 10}, 20)`);

const pie = d3.pie().value((d) => d.cost);

const arcGen = d3
    .arc()
    .outerRadius(dims.radius)
    .innerRadius(dims.radius / 2);

const color = d3.scaleOrdinal(d3["schemeSet2"]);
const legend = d3.legendColor().shape("circle").scale(color);

function update(data) {
    color.domain(data.map((d) => d.name));

    legendGroup.call(legend).selectAll("text").attr("fill", "#fff");

    const paths = chart.selectAll("path").data(pie(data));

    paths.transition("update").duration(1000).attrTween("d", arcTweenUpdate);

    paths
        .enter()
        .append("path")
        .attr("class", "arc")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1)
        .attr("id", (d) => d.data.name)
        .attr("fill", (d) => color(d.data.name))
        .each(function (d) {
            this._currentData = d;
        })
        .attr("d", arcGen)
        .transition("grow")
        .duration(1000)
        .attrTween("d", arcTweenEnter);

    chart
        .selectAll("path")
        .on("mouseover", handelMouseOver)
        .on("mouseleave", handelMouseLeave)
        .on("click", handelMouseClick);

    paths
        .exit()
        .transition("shrink")
        .duration(1000)
        .attrTween("d", arcTweenExit)
        .remove();
}

db.collection("expenses").onSnapshot((response) => {
    response.docChanges().forEach((change) => {
        let doc = { ...change.doc.data(), id: change.doc.id };
        switch (change.type) {
            case "added":
                data.push(doc);
                break;
            case "modified":
                let index = data.findIndex((d) => d.id === doc.id);
                data[index] = doc;
                break;
            case "removed":
                data = data.filter((d) => d.id !== doc.id);
                break;
            default:
                break;
        }
    });

    update(data);
});

function arcTweenEnter(d) {
    const i = d3.interpolate(d.endAngle, d.startAngle);
    return function (t) {
        d.startAngle = i(t);
        return arcGen(d);
    };
}

function arcTweenUpdate(d) {
    const i = d3.interpolate(this._currentData, d);
    this._currentData = i(1);
    return function (t) {
        return arcGen(i(t));
    };
}

function arcTweenExit(d) {
    const i = d3.interpolate(d.startAngle, d.endAngle);
    return function (t) {
        d.startAngle = i(t);
        return arcGen(d);
    };
}

function handelMouseOver(d) {
    const self = this;

    tip.html(
        `<p>${d.data.name}: $${d.data.cost},<br> <span class="pink-text text-lighten-3"> click to delete </span></p>`
    )
        .style("visibility", "visible")
        .style("top", `${d3.mouse(this)[1] + 80}px`)
        .style("left", `${d3.mouse(this)[0] + 150}px`);

    d3.select(this)
        .transition("hover")
        .duration(500)
        .attr("transform", "scale(1.05,1.05)");
}
function handelMouseLeave() {
    tip.text("").style("visibility", "hidden");
    d3.select(this)
        .transition("hover")
        .duration(500)
        .attr("transform", "scale(1,1)");
}

function handelMouseClick(d) {
    db.collection("expenses")
        .doc(d.data.id)
        .delete()
        .then(function () {
            console.log("Document successfully deleted!");
        })
        .catch(function (error) {
            console.error("Error removing document: ", error);
        });
}
