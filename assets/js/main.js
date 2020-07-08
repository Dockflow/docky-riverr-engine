/* global Promise, fetch, window, cytoscape, document, tippy, _ */

$(document).ready(function () {
    var cy = cytoscape({
        container: $('#cy'),
    });
    fetch('cy/cy-style.json').then(async (res) => {
        const json = await res.json();
        cy.style(json);
    });

    let options = {
        name: 'cose',

        // Called on `layoutready`
        ready: function () {},

        // Called on `layoutstop`
        stop: function () {},

        // Whether to animate while running the layout
        // true : Animate continuously as the layout is running
        // false : Just show the end result
        // 'end' : Animate with the end result, from the initial positions to the end positions
        animate: true,

        // Easing of the animation for animate:'end'
        animationEasing: undefined,

        // The duration of the animation for animate:'end'
        animationDuration: undefined,

        // A function that determines whether the node should be animated
        // All nodes animated by default on animate enabled
        // Non-animated nodes are positioned immediately when the layout starts
        animateFilter: function (node, i) {
            return true;
        },

        // The layout animates only after this many milliseconds for animate:true
        // (prevents flashing on fast runs)
        animationThreshold: 250,

        // Number of iterations between consecutive screen positions update
        refresh: 20,

        // Whether to fit the network view after when done
        fit: true,

        // Padding on fit
        padding: 30,

        // Constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
        boundingBox: undefined,

        // Excludes the label when calculating node bounding boxes for the layout algorithm
        nodeDimensionsIncludeLabels: false,

        // Randomize the initial positions of the nodes (true) or use existing positions (false)
        randomize: false,

        // Extra spacing between components in non-compound graphs
        componentSpacing: 40,

        // Node repulsion (non overlapping) multiplier
        nodeRepulsion: function (node) {
            return 2048;
        },

        // Node repulsion (overlapping) multiplier
        nodeOverlap: 4,

        // Ideal edge (non nested) length
        idealEdgeLength: function (edge) {
            return 32;
        },

        // Divisor to compute edge forces
        edgeElasticity: function (edge) {
            return 32;
        },

        // Nesting factor (multiplier) to compute ideal edge length for nested edges
        nestingFactor: 1.2,

        // Gravity force (constant)
        gravity: 1,

        // Maximum number of iterations to perform
        numIter: 1000,

        // Initial temperature (maximum node displacement)
        initialTemp: 1000,

        // Cooling factor (how the temperature is reduced between consecutive iterations
        coolingFactor: 0.99,

        // Lower temperature threshold (below this point the layout will end)
        minTemp: 1.0,
    };

    $.ajax({
        url: '/list/',
        type: 'GET',
        success: function (response) {
            console.log(response);
            var trHTML = '';
            $.each(response, function (i, item) {
                trHTML += '<tr><td><a href="#" data-key=' + item.id + '>' + item.id + '</a></td></tr>';
            });
            $('#run_list').append(trHTML);
        },
    });

    $(document).on('click', '#run_list a', function () {
        $.ajax({
            url: '/get',
            data: $(this).data(),
            type: 'GET',
            success: function (response) {
                $('#run_table').hide();
                $('#run_detail').show();
                $('#back_button').show();
                cy.json(response.graph_data);
                document.getElementById('detail_json').innerHTML = JSON.stringify(response.uotm_message, null, 2);
                cy.minZoom(1);
                cy.layout(options).run();
                $('#cy').css('height', '80vh');
                cy.resize();
                cy.fit();

                cy.elements().on('click', (e) => {
                    $('#detail_modal').modal('show');
                    document.getElementById('detail').innerHTML = JSON.stringify(e.target.data(), null, 2);
                    return false;
                });
            },
        });

        return false;
    });

    $(document).on('click', '#back_button', function () {
        $('#run_table').show();
        $('#run_detail').hide();
        $('#back_button').hide();
        return false;
    });
});
