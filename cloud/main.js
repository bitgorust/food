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

AV.Cloud.define("similar", function(request, response) {
    var Diet = AV.Object.extend("Diet");
    var dietQuery = new AV.Query(Diet);
    dietQuery.find().then(function(diets) {
        if (diets.length > 0) {
            return diets;
        }
        return null;
    }).then(function(diets) {
        if (diets != null) {
            var myDiet;
            for (var i = 0; i < diets.length; ++i) {
                if (diets[i].get("u_id") == request.params.u_id) {
                    myDiet = diets[i];
                    break;
                }
            }
            if (myDiet != null && diets.length > 1) {
                var result = {};
                for (var i = 0; i < diets.length; ++i) {
                    if (diets[i].get("u_id") != request.params.u_id) {
                        result[diets[i].get("u_id")] = similarity(myDiet, diets[i]);
                    }
                }
                return result;
            }
        }
        return null;
    }).then(function(result) {
        response.success(result);
    }, function(error) {
        response.error("no match result");
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

function similarity(diet1, diet2) {
    var shucai = 0.2 * itemSimilarity(diet1.get("shucai"), diet2.get("shucai"));
    var weidao = 0.2 * itemSimilarity(diet1.get("weidao"), diet2.get("weidao"));
    var roulei = 0.2 * itemSimilarity(diet1.get("roulei"), diet2.get("roulei"));
    var zhushi = 0.2 * itemSimilarity(diet1.get("zhushi"), diet2.get("zhushi"));
    var caixi  = 0.2 * itemSimilarity(diet1.get("caixi") , diet2.get("caixi") );
    return shucai + weidao + roulei + zhushi + caixi;
}

function itemSimilarity(item1, item2) {
    var v1 = item1.split(",");
    var v2 = item2.split(",");
    var intersect = v1.filter(function(n) {
        return v2.indexOf(n) > -1;
    });
    var union = v1.concat(v2).unique();
    return intersect.length / union.length;
}

Array.prototype.unique = function() {
    var a = this.concat();
    for (var i=0; i<a.length; ++i) {
        for (var j=i+1; j<a.length; ++j) {
            if (a[i] === a[j])
                a.splice(j--, 1);
        }
    }
    return a;
};

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
