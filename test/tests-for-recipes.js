const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

// this lets us use *should* style syntax in our tests
// so we can do things like `(1 + 1).should.equal(2);`
// http://chaijs.com/api/bdd/
const should = chai.should();

// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);


describe('Recipes', function(){

	before(function(){
	//Before running a function start the server.
		return runServer();
	});

	after(function(){
	//After running a test function close the server.
		return closeServer();
	});


	it('should list recipes on GET', function() {
		return chai.request(app)
			.get('/recipes')
			.then(function(res) {

				res.should.have.status(200);
				res.should.be.json;
				res.body.should.be.a('array');

				res.body.should.have.length.of.at.least(1);


				// each item should be an object with key/value pairs
        		// for `id`, `name` and `ingredients`.

        		res.body.forEach(function(item){
        			item.should.be.a('object');
        			item.should.include.keys('id', 'name','ingredients');
        		});
			});
	});


	it('should add a recipe on POST', function(){
		const newRecipe = {
			name: 'coffee', ingredients: ['ground coffee', 'hot water']};

		return chai.request(app)
			.post('/recipes')
			.send(newRecipe)
			.then(function(res) {
				res.should.have.status(201);
				res.should.be.json;
				res.body.should.be.a('object');
				res.body.should.include.keys('id', 'name', 'ingredients');
				res.body.name.should.equal(newRecipe.name);
				res.body.ingredients.should.be.a('array');
				res.body.ingredients.should.include.members(newRecipe.ingredients);
			});
	});


	it('should update recipes on PUT', function(){
		const updateData = {
			name: 'foo',
			ingredients: ['bizz', 'bang']
		};

		return chai.request(app)
			.get('/recipes')
			.then(function(res) {
				updateData.id = res.body[0].id;

				return chai.request(app)
					.put(`/recipes/${updateData.id}`)
					.send(updateData)
			})

			.then(function(res) {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.include.keys('id', 'name', 'ingredients');
				res.body.name.should.equal(updateData.name);
				res.body.id.should.equal(updateData.id);
				res.body.ingredients.should.include.members(updateData.ingredients);
			});
	});


	it('should delete recipes on DELETE', function() {
		return chai.request(app)

			.get('/recipes')
			.then(function(res) {
				return chai.request(app)
					.delete(`/recipes/${res.body[0].id}`)
			});
	});

});