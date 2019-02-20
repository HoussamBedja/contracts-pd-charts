"use strict";

function _toConsumableArray(arr) {
    let i;
    let arr2;
    if (Array.isArray(arr)) {
        for ( i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; }
    else { return Array.from(arr);
    }
}

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

let dispatch = d3.dispatch("load_choice", "load_table", "update_table", "load_chart", "update_chart");

let start_dept = ["All Departments"];
let start_year = ["2016"];
let dept_list = [];
let years_list = []; 

let fmt_pct = function(d) { return "$" + d3.format(".2s")(d).replace(/G/,"B"); }
let formatDollar = function(d) { return "$" + d3.format(".2s")(d).replace(/G/,"B"); }




    // if (typeof window.AudioContext !== "undefined") {
    //
    //     var context = new window.AudioContext;
    //     var oscillator = context.createOscillator();
    //     oscillator.start();
    //
    //  } else if (typeof window.webkitAudioContext !== "undefined") {
    //     var context =  new window.webkitAudioContext;
    //     var oscillator = context.createOscillator();
    //     oscillator.start();
    // } else {
    //
    // }

let z = d3.scaleOrdinal(d3.schemeCategory20);

function test_func(error, sos_data) {

    // if (typeof window.AudioContext !== "undefined") {
    //
    //     var context = new window.AudioContext;
    //     var oscillator = context.createOscillator();
    //     oscillator.start();
    //
    // } else if (typeof window.webkitAudioContext !== "undefined") {
    //     var context = new window.webkitAudioContext;
    //     var oscillator = context.createOscillator();
    //     oscillator.start();
    // } else {
    //
    // }

    if (error){
        console.log("Error on data load");
    }

    //console.log("sos_data: " + JSON.stringify(sos_data));

    var types = _.uniq(_.pluck(sos_data, 'type'));
    var years = _.uniq(_.pluck(sos_data, 'year'));

    
    // Adding 'All departments' rows
    for (var year in years) {

        for (var index in types) {
            //console.log("availableType: " + types[index]);
            var combinations = _.filter(sos_data, function (row) {
                return types[index] == row.type && years[year] == row.year;
            });
            var number_contracts = _.reduce(_.pluck(combinations, 'number_contracts'), function(memo, num){ return memo + parseInt(num); }, 0);
            var contracts_value = _.reduce(_.pluck(combinations, 'contracts_value'), function(memo, num){ return memo + parseInt(num); }, 0);
            var newCombination = {
                "department":"All Departments",
                "year": years[year],
                "type": types[index],
                "number_contracts": number_contracts,
                "contracts_value": contracts_value
            };
            sos_data.push(newCombination);
        }
    }

    let sos_graph_data = _.chain(sos_data).groupBy('year').value();


    //console.log("sos_graph_data: " + JSON.stringify(sos_graph_data));

    dept_list = _.uniq(_.pluck(sos_data, 'department')).sort();

    // move 'All departments to the beginning of the list'
    dept_list.splice( dept_list.indexOf("All Departments"), 1 );
    dept_list.unshift("All Departments");

    years_list = _.uniq(_.pluck(sos_data, 'year')).sort();


    let groups = _.groupBy(sos_data, function (value) {
        return value.year + '#' + value.department;
    });

    let new_table_data = _.map(groups, function (group) {

        let mapped = _.map(group, function (ans) {
            return _defineProperty({}, ans.type, ans.contracts_value);
        });


        let type_keys = _.uniq(_.map(group, function (key) {
            return key.type;
        }));


        let newObj2 =  _.extend.apply(null, mapped);

        return _.extend(newObj2, {
            DEPT: group[0].department,
            Year: group[0].year,
            type_keys : type_keys,
        });


       // return newObj3;
    });

    dispatch.call("load_choice", undefined, new_table_data, sos_graph_data/*, var_info*/);
    dispatch.call("load_table", undefined, new_table_data);
    dispatch.call("load_chart", undefined, sos_graph_data);

}
function init() {
    d3.queue()
        .defer(d3.csv, 'contracts-summary.csv')
        .await(test_func); //only function name is needed
}

init();
