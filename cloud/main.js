// Use AV.Cloud.define to define as many cloud functions as you want.
// For example:
AV.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});

AV.Cloud.define("diet", function(request, response) {
    var Order = AV.Object.extend("Order");
    var Food = AV.Object.extend("Food");
    var orderQuery = new AV.Query(Order);
    orderQuery.equalTo("u_id", request.params.u_id);
    var foodQuery = new AV.Query(Food);
    foodQuery.matchesKeyInQuery("f_name", "name", orderQuery);
    foodQuery.include(["r_name"]);
    foodQuery.find({
        success: function(foods) {
            response.success(foods);
        }
        error: function() {
            response.error("user diet lookup failed");
        }
    });
}); 
