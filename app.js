const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.use(express.static(__dirname + "/public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));


mongoose.connect("mongodb://localhost:27017/todo-app", {useNewUrlParser: true},(err,res)=>{
	if(err){
		console.log(err);
	} else{
		console.log('Database connected');
	}
});

const itemsSchema = new mongoose.Schema ({
	name: {
		type: String
	}
});

const listSchema = {
	name: String,
	items: [itemsSchema]
};

const Item = mongoose.model("Item", itemsSchema);

const List = mongoose.model("List", listSchema);

const defaultItems = [];

let port = process.env.PORT;
if (port == null || port == "") {
	port = 3000;
}
app.listen(port, function() {
	console.log("Server started at port 3000.");
});

app.get("/", function(req, res){
	Item.find({}, function(err, items){
		if (err){
			console.log(err);
		} else {
			res.render('list', {listTitle: "Today", items: items});
		}
	});
});

app.get('/:listName', function(req, res) {
	const listName = _.capitalize(req.params.listName);

	List.findOne({ name: listName }, function (err, list) {
		if (!err) {
			if (!list) {
				const list = new List({
					name: listName,
					items: defaultItems
				});
				list.save();
				res.redirect("/" + listName);
				console.log('Created the list ', list.name);
			} else {
				res.render('list', {listTitle: list.name, items: list.items});
				console.log('Loaded the list ', list.name);
			}
		} else {
			console.log(err);
		}
	});
});

app.post("/add", function(req, res) {
	const item = { name: req.body.item };
	const listName = req.body.list;

	if (listName === "Today") {
		Item.insertMany(item, function(err){
			if (err){
				console.log(err);
			} else {
				console.log("success!");
			}
		});
		res.redirect("/");
	} else {
		List.findOne({name: listName}, function(err, foundList){
			foundList.items.push(item);
			foundList.save();
			res.redirect("/" + listName);
		})
	}
});

app.post("/delete", function(req, res) {
	const listName = req.body.listName;
		Item.findOneAndDelete({_id: req.body.itemDelete}, function(err){
			if (err){
				console.log(err);
			} else {
				console.log("success! Item deleted");
			}
		});
	res.redirect("/");
});