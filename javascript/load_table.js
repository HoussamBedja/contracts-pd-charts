"use strict";

function _toConsumableArray(arr) {
    let i;
    let arr2;
    if (Array.isArray(arr)) {
        for ( i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; }
    else { return Array.from(arr);
    }
}


dispatch.on("load_table", function (tbl_data) {


    let filt_SOS_data = _.filter(tbl_data, function (row) {
        return _.contains(start_dept, row.DEPT) && _.contains(start_year, row.Year);
    });

    // console.log("filt_SOS_data: " + JSON.stringify(filt_SOS_data));

    let new_type_keys = _.uniq(_.flatten(_.pluck(filt_SOS_data, 'type_keys')));


    let columns = ["Series","DEPT"].concat(_toConsumableArray(new_type_keys));

    let table = d3.select("#table_div")
                    .append('table')
                    .attr("id", "adv_tbl")
                    .attr("class","table table-striped table-hover")

    $(document).ready( function () {
        $('#adv_tbl').DataTable({
            "paging": false,
            "searching": false
        });
    } );


    table.append("caption").text("Proactive Disclosure - Contracts Over $10k");

    let thead = table.append('thead');
    let tbody = table.append('tbody');

    thead
        .append('tr')
        .attr("class", "active")
        .selectAll('th')
        .data(columns)
        .enter()
        .append('th')
        .attr("scope","col")
        .text(function (label) {
            return label === "DEPT" ? "Organisation" : label;
        });

    let rows_grp = tbody.selectAll('tr').data(filt_SOS_data);
    // .data(filt_SOS_data);


    let rows_grp_enter = rows_grp.enter().append('tr');

    rows_grp_enter.merge(rows_grp);

    rows_grp_enter.selectAll('td').data(function (row) {
        let total = 0;
        for (var i in row.type_keys) {
            total += parseInt(row[row.type_keys[i]]);
        }

        return columns.map(function (column) {
            let average = "(" + Math.round((parseInt(row[column])/total)*100) + "%)";
            return { column: column, value: row[column], dept: row.DEPT, average: average };
        });
    }).enter().append('td')
        .attr("scope",function (d,i) {
            return i === 0 ? "row" : undefined;
        })
        .html(function (d) {
        if (d.column === "Series") {
            return '<svg width="20" height="20"><title>Series color</title><desc>'+ d.dept + '</desc><rect width="20" height="20"  fill="' + z(d.dept) + '"/> </svg>';
        } else {
            return isNaN(d.value) ? d.value : d.column === "total" ? d.value : fmt_pct(d.value) + ' ' + d.average;
        }
    });

    dispatch.on("update_table", function (d) {

        $('#adv_tbl').DataTable().destroy(); 

        let answer_keys = _.uniq(_.flatten(_.pluck(d, 'type_keys')));

        let new_columns = ["Series","DEPT"].concat(_toConsumableArray(answer_keys));

        let table_u = d3.select('table');

        let tbody_u = table_u.select('tbody');

        let thead_u = table_u.select('thead').select('tr');

        let thead_u_th = thead_u.selectAll('th').data(new_columns);

        thead_u_th.exit().remove();

        let thead_u_th_enter = thead_u_th.enter().append('th');

        thead_u_th.merge(thead_u_th_enter).text(function (label) {
            return label === "DEPT" ? "Organisation" : label;
        });

        let rows_grp_u = tbody_u.selectAll('tr').data(d);

        rows_grp_u.exit().remove();

        let rows_grp_enter_u = rows_grp_u.enter().append('tr');

        let new_tds = rows_grp_u.merge(rows_grp_enter_u).selectAll('td').data(function (row) {
            console.log("row:" + JSON.stringify(row));
            let total = 0;
            for (var i in row.type_keys) {
                total += parseInt(row[row.type_keys[i]]);
            }
            console.log("total = " + total);
            
            return new_columns.map(function (column) {
                let average = "(" + Math.round((parseInt(row[column])/total)*100) + "%)";
                console.log("average: " + average);
                console.log("returned:" + JSON.stringify({ column: column, value: row[column], dept: row.DEPT, average: average }));
                return { column: column, value: row[column], dept: row.DEPT, average: average };
            });
        });
        new_tds.exit().remove();

        new_tds
            .attr("scope",function (d,i) {
                return i === 0 ? "row" : undefined;
            })
            .html(function (d) {
                if (d.column === "Series") {
                       return '<svg width="20" height="20"><title>Series color</title><desc>'+ d.dept + '</desc><rect width="20" height="20"  fill="' + z(d.dept) + '"/></svg>';
                } else {
                    return isNaN(d.value) ? d.value : d.column === "total" ? d.value : fmt_pct(d.value) + ' ' + d.average;
                }
            });

        new_tds.enter().append('td')
            .attr("scope",function (d,i) {
                return i === 0 ? "row" : undefined;
            })
            .html(function (d) {
                if (d.column === "Series") {
                    return '<svg width="20" height="20"><title>Series color</title><desc>'+ d.dept + '</desc><rect width="20" height="20"  fill="' + z(d.dept) + '"/></svg>';
                } else {
                    return isNaN(d.value) ? d.value : d.column === "total" ? d.value : fmt_pct(d.value) + ' ' + d.average;
                }
            });
       
        $('#adv_tbl').DataTable({
                "paging": false,
                "searching": false
        });     
    });
});




