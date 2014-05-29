require('cloud/app.js');

// Use AV.Cloud.define to define as many cloud functions as you want.
// For example:
AV.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});

AV.Cloud.define("today", function(request, response) {
    var Food = AV.Object.extend("Food");
    var foodQuery = new AV.Query(Food);
    foodQuery.limit(request.params.limit);
    foodQuery.notEqualTo("url", "");
    foodQuery.select("name", "r_id", "url");
    foodQuery.find().then(function(foods) {
        return foods;
    }).then(function(foods) {
        response.success(foods);
    }, function(error) {
        response.error("today's foods lookup failed");
    });
});

AV.Cloud.define("diet", function(request, response) {
    var Order = AV.Object.extend("Order");
    var Food = AV.Object.extend("Food");
    var orderQuery = new AV.Query(Order);
    orderQuery.equalTo("u_id", request.params.u_id);
    var foodQuery = new AV.Query(Food);
    foodQuery.matchesKeyInQuery("name", "f_name", orderQuery);
    foodQuery.select("name", "r_id", "shucai", "weidao", "roulei", "zhushi", "caixi");
    foodQuery.find().then(function(foods) {
        var shucai = {}, weidao = {}, roulei = {}, zhushi = {}, caixi = {};
        if (foods.length > 0) {
            for (var i = 0; i < foods.length; ++i) {
                add_to_map(shucai, foods[i].get("shucai"));
                add_to_map(weidao, foods[i].get("weidao"));
                add_to_map(roulei, foods[i].get("roulei"));
                add_to_map(zhushi, foods[i].get("zhushi"));
                add_to_map(caixi,  foods[i].get("caixi"));
            }
            return {
                "shucai" : shucai,
                "weidao" : weidao,
                "roulei" : roulei,
                "zhushi" : zhushi,
                "caixi"  : caixi
                };
        }
        return null;
    }).then(function(diet) {
        response.success(diet);
    }, function(error) {
        response.error("user diet get failed");
    });
}); 

function add_to_map(map, item) {
    if (item && item !== "") {
        var strs = item.split(",");
        for (var i = 0; i < strs.length; ++i) {
            if (strs[i] in map) {
                map[strs[i]] = map[strs[i]] + 1;
            } else {
                map[strs[i]] = 1;
            }
        }
    }
}
