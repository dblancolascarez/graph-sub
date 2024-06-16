(function() {

    if (!('xpush' in Array.prototype)) {
        Array.prototype.xpush = function(value) {
            if (this.indexOf(value) === -1) {
                this.push(value);
            }
            return this;
        };
    };

    d3.graphSub = function() {

        var config = {
            width: 1000,
            height: 500,
            hops: 2
        };

        function chart(selection) {
            selection.each(function(d, i) {

                // DOM
                var current_selection = this;

                var model = {};

                var controller = {

                    init: function() {
                        model.graph = d;
                        model.force = d3.layout.force();
                        model.force2 = d3.layout.force();
                        model.subNetNodes = model.force.nodes();
                        model.subNetLinks = model.force.links();
                        model.linkStrings = [];
                        model.labelAnchors = model.force2.nodes();
                        model.labelAnchorLinks = model.force2.links();

                        // Busqueda de nodos
                        model.nodeNames = [];
                        for (var i = 0; i < model.graph.nodes.length; i++) {
                            model.nodeNames.push({
                                'label': model.graph.nodes[i].name,
                                'value': i + ''
                            });
                        };

                        view.init();

                        this.getSubnet(0, 1)
                        this.click(model.subNetNodes[0]);
                    },

                    graphNodes: function() {
                        return model.graph.nodes;
                    },

                    graphLinks: function() {
                        return model.graph.links;
                    },

                    // layout link
                    addLink: function(source, target, value) {
                        var link = {
                            "source": this.findNode(source),
                            "target": this.findNode(target),
                            "value": value
                        };
                        model.subNetLinks.push(link);
                    },

                    findNode: function(name) {
                        for (var i in model.graph.nodes) {
                            if (model.graph.nodes[i]["name"] === name) return model.graph.nodes[i];
                        };
                    },

                    removeAllLinks: function(linkArray) {
                        linkArray.splice(0, linkArray.length);
                    },

                    removeAllNodes: function(nodeArray) {
                        nodeArray.splice(0, nodeArray.length);
                    },

                    findNodeIndex: function(name, nodes) {
                        for (var i = 0; i < nodes.length; i++) {
                            if (nodes[i].name == name) {
                                return i;
                            }
                        };
                    },

                    createAnchors: function() {
                        for (var i = 0; i < model.subNetNodes.length; i++) {
                            var n = {
                                label: model.subNetNodes[i]
                            };

                            model.labelAnchors.push({
                                node: n,
                                type: "tail"
                            });
                            model.labelAnchors.push({
                                node: n,
                                type: "head"
                            });
                        };
                    },

                    createAnchorLinks: function() {
                        for (var i = 0; i < model.subNetNodes.length; i++) {
                            // los nodos estan conectados en parejas
                            model.labelAnchorLinks.push({
                                source: i * 2,
                                target: i * 2 + 1,
                                weight: 1
                            });
                        };
                    },

                    getSubnet: function(currentIndex, hops) {
                        // Los links son guardados como objetos JSON
                        // Se cargan los datos del JSON
                        var n = model.graph.nodes[currentIndex];

                        model.subNetNodes.xpush(n);

                        if (hops === 0) {
                            return;
                        };

                        for (var i = 0; i < model.graph.links.length; i++) {

                            if (currentIndex === model.graph.links[i].source) {
                                model.linkStrings.xpush(JSON.stringify(model.graph.links[i]));
                                this.getSubnet(model.graph.links[i].target, hops - 1)
                            };
                            if (currentIndex === model.graph.links[i].target) {
                                model.linkStrings.xpush(JSON.stringify(model.graph.links[i]));
                                this.getSubnet(model.graph.links[i].source, hops - 1)
                            };
                        };
                    },

                    click: function(d) {
                        var nodeName;

                        if (d.hasOwnProperty('node')) {

                            nodeName = d.node.label.name;
                        } else {
                            nodeName = d.name;
                        };

                        $("#search").val(nodeName);

                        // Refrescar grafo con nuevos links
                        model.linkStrings = []; // variable para almacenar links

                        this.removeAllNodes(model.subNetNodes); 
                        this.removeAllLinks(model.subNetLinks); 

                        this.removeAllNodes(model.labelAnchors);
                        this.removeAllLinks(model.labelAnchorLinks);

                        var link,
                            source,
                            target;


                        this.getSubnet(this.findNodeIndex(nodeName, model.graph.nodes), config.hops);
                        this.createAnchors();

                        view.render();


                        for (var i = 0; i < model.linkStrings.length; i++) {
                            link = JSON.parse(model.linkStrings[i]);

                            source = model.graph.nodes[link.source];
                            target = model.graph.nodes[link.target];
                            this.addLink(source.name, target.name, 2);

                        };

                        this.createAnchorLinks();

                        view.render();
                    }

                };

                var view = {

                    init: function() {
                        d3.select(window).on("resize", this.resize)

                        this.color = d3.scale.category10();

                        this.viz = d3.select(current_selection)
                            .append("svg:svg")
                            .attr("width", config.width)
                            .attr("height", config.height)
                            .attr("id", "svg")
                            .call(d3.behavior.zoom())
                            .attr("pointer-events", "all")
                            .attr("viewBox", "0 0 " + 1000 + " " + 500)
                            .attr("perserveAspectRatio", "xMinYMid")
                            .append('svg:g');

                        this.viz.insert("defs")
                            .selectAll("marker")
                            .data(["suit", "licensing", "resolved"])
                            .enter()
                            .append("marker")
                            .attr("id", function(d) {
                                return d;
                            })
                            .attr("viewBox", "0 -5 10 10")
                            .attr("refX", 5)
                            .attr("refY", 0)
                            .attr("markerWidth", 6)
                            .attr("markerHeight", 6)
                            .attr("orient", "auto")
                            .append("path")
                            .attr("d", "M0,-1L5,0L0,1");

                        d3.select("defs")
                            .insert("linearGradient")
                            .attr("id", "linearGradient")
                            .attr("x1", "0%")
                            .attr("y1", "0%")
                            .attr("x2", "100%")
                            .attr("y2", "100%")
                            .attr("spreadMethod", "pad");

                        d3.select("linearGradient")
                            .insert("stop")
                            .attr("offset", "0%")
                            .attr("stop-color", "grey")
                            .attr("stop-opacity", "0");

                        d3.select("linearGradient")
                            .insert("stop")
                            .attr("offset", "100%")
                            .attr("stop-color", "grey")
                            .attr("stop-opacity", "1");


                        $("#search").val('');

                        $("#search").autocomplete({
                            source: model.nodeNames,

                            select: function(event, ui) {
                                event.preventDefault();
                                controller.click(controller.graphNodes()[+ui.item.value], +ui.item.value);
                                $("#search").val(ui.item.label);
                            },

                            focus: function(event, ui) {
                                event.preventDefault();
                                $("#search").val(ui.item.label);
                            }
                        });
                    },

                    resize: function() {
                        x = window.innerWidth || e.clientWidth || g.clientWidth;
                        y = window.innerHeight || e.clientHeight || g.clientHeight;

                        d3.select("svg").attr("width", x).attr("height", y);
                    },

                    render: function() {

                        // join
                        var link = view.viz.selectAll("line")
                            .data(model.subNetLinks, function(d) {
                                return d.source.name + "-" + d.target.name;
                            });

                        // enter
                        link.enter().insert("line", "g")
                            .attr("id", function(d) {
                                return d.source.name + "-" + d.target
                                    .name;
                            })
                            .attr("stroke-width", function(d) {
                                return d.value / 10;
                            })
                            .attr("stroke", "grey")
                            .attr("opacity", "0.5")
                            .attr("class", "link")
                            .attr("marker-end", "url(#suit)");

                        // update
                        link.append("title")
                            .text(function(d) {
                                return d.value;
                            });

                        // exit
                        link.exit().remove();

                        // join
                        var node = this.viz.selectAll("g.node")
                            .data(model.subNetNodes, function(d) {
                                return d.name;
                            });

                        // enter
                        var nodeEnter = node.enter()
                            .append("g")
                            .attr("class", "node");


                        // enter
                        nodeEnter
                            .append("svg:circle")
                            .attr("r", 0)
                            .attr("id", function(d) {
                                return "Node;" + d.name;
                            })
                            .attr("class", "nodeStrokeClass")
                            .attr("fill", function(d) {
                                return view.color(d.group);
                            });

                        // exit
                        node.exit().remove();

                        // join
                        var anchorLink = this.viz.selectAll("line.anchorLink")
                            .data(model.labelAnchorLinks); 

                        // join
                        var anchorNode = this.viz.selectAll("g.anchorNode")
                            .data(model.labelAnchors, function(d, i) {
                                return d.node.label.name + d.type;
                            });

                        // enter
                        var anchorNodeEnter = anchorNode
                            .enter()
                            .append("svg:g")
                            .attr("class", "anchorNode");

                        anchorNodeEnter
                            .on('click', function(d) {
                                controller.click(d);
                            }, false)

                        // enter
                        anchorNodeEnter
                            .append("svg:circle")
                            .attr("r", 0)
                            .style("fill", "red");

                        // enter
                        anchorNodeEnter
                            .append("svg:text")
                            .text(function(d, i) {
                                return i % 2 == 0 ? "" : d.node.label.name
                            })
                            .attr("class", "textClass")
                            .style("fill", "black")
                            .style("font-family", "Arial")
                            .style("font-size", 20);

                        // cuadro de color en el texto
                        anchorNode.each(function(d, i) {
                            if (i % 2 != 0) {
                                var textElem = this.childNodes[1].getBBox();
                                if (this.childNodes.length === 2) {
                                    d3.select(this)
                                        .insert("rect", "text")
                                        .attr("width", textElem.width)
                                        .attr("height", textElem.height)
                                        .attr("y", textElem.y)
                                        .attr("x", textElem.x)
                                        .attr("fill", function(d) {
                                            return view.color(d.node.label.group);
                                        })
                                        .attr("opacity", "0.3");
                                };

                            };
                        });


                        // exit
                        anchorNode.exit().remove();

                        model.force
                            .size([config.width, config.height])
                            .charge(-3000)
                            .gravity(1)
                            .linkDistance(50)
                            .start();

                        model.force2
                            .size([config.width, config.height])
                            .gravity(0)
                            .linkDistance(0)
                            .linkStrength(8)
                            .charge(-200)
                            .start();


                        var updateLink = function() {
                            this.attr("x1", function(d) {
                                return d.source.x;
                            }).attr("y1", function(d) {
                                return d.source.y;
                            }).attr("x2", function(d) {
                                return d.target.x;
                            }).attr("y2", function(d) {
                                return d.target.y;
                            });
                        }

                        var updateNode = function() {
                            this.attr("transform", function(d) {
                                return "translate(" + d.x + "," + d.y + ")";
                            });
                        }

                        model.force.on("tick", function() {

                            model.force2.start();

                            //---------
                            node.call(updateNode);

                            anchorNode.each(function(d, i) {

                                if (i % 2 == 0) {

                                    d.x = d.node.label.x;
                                    d.y = d.node.label.y;
                                } else {
                                    var b = this.childNodes[1].getBBox();

                                    var diffX = d.x - d.node.label.x;
                                    var diffY = d.y - d.node.label.y;

                                    var dist = Math.sqrt(diffX * diffX + diffY * diffY);

                                    var shiftX = b.width * (diffX - dist) / (dist * 2);
                                    shiftX = Math.max(-b.width, Math.min(0, shiftX));

                                    var shiftY = 5;

                                    this.childNodes[1].setAttribute("transform", "translate(" + shiftX + "," + shiftY + ")");
  
                                    this.childNodes[2].setAttribute("transform", "translate(" + shiftX + "," + shiftY + ")");
                                }
                            });
                            anchorNode.call(updateNode);

                            link.call(updateLink);

                            anchorLink.call(updateLink);
                        });
                        ///                
                    }

                }

                controller.init();
            });


        };

        chart.width = function(value) {
            if (!arguments.length) return config.width;
            config.width = value;
            return chart; 
        };

        chart.height = function(value) {
            if (!arguments.length) return config.height;
            config.height = value;
            return chart; 
        };

        chart.hops = function(value) {
            if (!arguments.length) return config.hops;
            config.hops = value;
            return chart; 
        };

        return chart;

    };
})();

/*----------------------------------------------------------------------------
*/


$(function() {
    $("#search").autocomplete({
        source: ["Diseases", "Eurosis", "School"]
    });

    $("#combobox").on("change", function() {
        var selectedValue = $(this).val();
        loadData(selectedValue);
    });

    loadData("data/diseases.json");
});

function loadData(dataset) {

    d3.json(dataset, function(error, graph) {
        if (error) throw error;

        document.getElementById('chart').innerHTML = '';


        var chart = d3.graphSub()
            .width(760)
            .height(500)
            .hops(2);

        d3.select("#chart")
            .datum(graph)
            .call(chart);
    });
}


