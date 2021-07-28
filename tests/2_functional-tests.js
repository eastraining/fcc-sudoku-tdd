const chai = require("chai");
const chaiHttp = require('chai-http');
const assert = chai.assert;
const expect = chai.expect;
const server = require('../server');
import { puzzlesAndSolutions } from '../controllers/puzzle-strings.js';

const VALID_UNSOLVED_PUZZLE = puzzlesAndSolutions[0][0];
const VALID_SOLVED_PUZZLE = puzzlesAndSolutions[0][1];
const INVALID_CHAR_PUZZLE = VALID_UNSOLVED_PUZZLE.slice(0, 80).concat('z');
const INVALID_LEN_PUZZLE = VALID_UNSOLVED_PUZZLE.slice(0, 80);
const INVALID_SOL_PUZZLE = VALID_UNSOLVED_PUZZLE.slice(0, 79).concat('77');
const VALID_UNSOLVED_PUZZLE_2 = '....3.68...259873....7.......3.2.5..6..9......54....9.7...4...18..2....3345.7....';
const VALID_SOLVED_PUZZLE_2 = '479132685162598734538764219913427568687915342254683197726349851891256473345871926';


chai.use(chaiHttp);

suite('Functional Tests', () => {
  suite('Solving puzzle with POST request to /api/solve', function() {
    // #1
    test('Solve a puzzle with valid puzzle string', function(done) {
      chai.request(server)
      .post('/api/solve')
      .send({ puzzle: VALID_UNSOLVED_PUZZLE_2 })
      .end(function(err, res) {
        assert.equal(res.status, 200, 'server response is 200');
        expect(res).to.have.a.property('type').that.equals('application/json');
        expect(res).to.have.a.property('body').that.is.an('object');
        expect(res.body).to.have.a.property('solution').that.is.a('string').that
        .equals(VALID_SOLVED_PUZZLE_2);
        done();
      });
    });
    // #2
    test('Solve a puzzle with missing puzzle string', function(done) {
      chai.request(server)
      .post('/api/solve')
      .send({ puzzle: "" })
      .end(function(err, res) {
        assert.equal(res.status, 200, 'server response is 200');
        expect(res).to.have.a.property('type').that.equals('application/json');
        expect(res).to.have.a.property('body').that.is.an('object');
        expect(res.body).to.have.a.property('error').that.is.a('string').that
        .equals('Required field missing');
        done();
      });
    });
    // #3
    test('Solve a puzzle with invalid characters', function(done) {
      chai.request(server)
      .post('/api/solve')
      .send({ puzzle: INVALID_CHAR_PUZZLE })
      .end(function(err, res) {
        assert.equal(res.status, 200, 'server response is 200');
        expect(res).to.have.a.property('type').that.equals('application/json');
        expect(res).to.have.a.property('body').that.is.an('object');
        expect(res.body).to.have.a.property('error').that.is.a('string').that
        .equals('Invalid characters in puzzle');
        done();
      });
    });
    // #4
    test('Solve a puzzle with incorrect length', function(done) {
      chai.request(server)
      .post('/api/solve')
      .send({ puzzle: INVALID_LEN_PUZZLE })
      .end(function(err, res) {
        assert.equal(res.status, 200, 'server response is 200');
        expect(res).to.have.a.property('type').that.equals('application/json');
        expect(res).to.have.a.property('body').that.is.an('object');
        expect(res.body).to.have.a.property('error').that.is.a('string').that
        .equals('Expected puzzle to be 81 characters long');
        done();
      });
    });
    // #5
    test('Solve a puzzle that cannot be solved', function(done) {
      chai.request(server)
      .post('/api/solve')
      .send({ puzzle: INVALID_SOL_PUZZLE })
      .end(function(err, res) {
        assert.equal(res.status, 200, 'server response is 200');
        expect(res).to.have.a.property('type').that.equals('application/json');
        expect(res).to.have.a.property('body').that.is.an('object');
        expect(res.body).to.have.a.property('error').that.is.a('string').that
        .equals('Puzzle cannot be solved');
        done();
      });
    });
  });

  suite('Checking puzzle with POST request to /api/check', function() {
    // #6
    test('Check a puzzle placement with all fields', function(done) {
      chai.request(server)
      .post('/api/check')
      .send({ puzzle: VALID_UNSOLVED_PUZZLE, coordinate: "A2", value: "3" })
      .end(function(err, res) {
        assert.equal(res.status, 200, 'server response is 200');
        expect(res).to.have.a.property('type').that.equals('application/json');
        expect(res).to.have.a.property('body').that.is.an('object');
        expect(res.body).to.have.a.property('valid').that.equals(true);
        done();
      });
    });
    // #7
    test('Check a puzzle placement with single placement conflict', function(done) {
      chai.request(server)
      .post('/api/check')
      .send({ puzzle: VALID_UNSOLVED_PUZZLE, coordinate: "A2", value: "7" })
      .end(function(err, res) {
        assert.equal(res.status, 200, 'server response is 200');
        expect(res).to.have.a.property('type').that.equals('application/json');
        expect(res).to.have.a.property('body').that.is.an('object');
        expect(res.body).to.have.a.property('valid').that.equals(false);
        expect(res.body).to.have.a.property('conflict').that.is.an('array')
        .that.has.lengthOf(1);
        expect(res.body.conflict[0]).to.be.a('string').that.equals('column');
        done();
      });
    });
    // #8
    test('Check a puzzle placement with multiple placement conflicts', function(done) {
      chai.request(server)
      .post('/api/check')
      .send({ puzzle: VALID_UNSOLVED_PUZZLE, coordinate: "A2", value: "6" })
      .end(function(err, res) {
        assert.equal(res.status, 200, 'server response is 200');
        expect(res).to.have.a.property('type').that.equals('application/json');
        expect(res).to.have.a.property('body').that.is.an('object');
        expect(res.body).to.have.a.property('valid').that.equals(false);
        expect(res.body).to.have.a.property('conflict').that.is.an('array')
        .that.has.lengthOf(2);
        expect(res.body.conflict[0]).to.be.a('string').that.equals('column');
        expect(res.body.conflict[1]).to.be.a('string').that.equals('region');
        done();
      });
    });
    // #9
    test('Check a puzzle placement with all placement conflicts', function(done) {
      chai.request(server)
      .post('/api/check')
      .send({ puzzle: VALID_UNSOLVED_PUZZLE, coordinate: "A2", value: "2" })
      .end(function(err, res) {
        assert.equal(res.status, 200, 'server response is 200');
        expect(res).to.have.a.property('type').that.equals('application/json');
        expect(res).to.have.a.property('body').that.is.an('object');
        expect(res.body).to.have.a.property('valid').that.equals(false);
        expect(res.body).to.have.a.property('conflict').that.is.an('array')
        .that.has.lengthOf(3);
        expect(res.body.conflict[0]).to.be.a('string').that.equals('row');
        expect(res.body.conflict[1]).to.be.a('string').that.equals('column');
        expect(res.body.conflict[2]).to.be.a('string').that.equals('region');
        done();
      });
    });
    // #10
    test('Check a puzzle placement with missing required fields', function(done) {
      chai.request(server)
      .post('/api/check')
      .send({ puzzle: VALID_UNSOLVED_PUZZLE, value: "2" })
      .end(function(err, res) {
        assert.equal(res.status, 200, 'server response is 200');
        expect(res).to.have.a.property('type').that.equals('application/json');
        expect(res).to.have.a.property('body').that.is.an('object');
        expect(res.body).to.have.a.property('error').that.is.a('string').that
        .equals('Required field(s) missing');
        done();
      });
    });
    // #11
    test('Check a puzzle placement with invalid characters', function(done) {
      chai.request(server)
      .post('/api/check')
      .send({ puzzle: INVALID_CHAR_PUZZLE, coordinate: "A2", value: "2" })
      .end(function(err, res) {
        assert.equal(res.status, 200, 'server response is 200');
        expect(res).to.have.a.property('type').that.equals('application/json');
        expect(res).to.have.a.property('body').that.is.an('object');
        expect(res.body).to.have.a.property('error').that.is.a('string').that
        .equals('Invalid characters in puzzle');
        done();
      });
    });
    // #12
    test('Check a puzzle placement with incorrect length', function(done) {
      chai.request(server)
      .post('/api/check')
      .send({ puzzle: INVALID_LEN_PUZZLE, coordinate: "A2", value: "2" })
      .end(function(err, res) {
        assert.equal(res.status, 200, 'server response is 200');
        expect(res).to.have.a.property('type').that.equals('application/json');
        expect(res).to.have.a.property('body').that.is.an('object');
        expect(res.body).to.have.a.property('error').that.is.a('string').that
        .equals('Expected puzzle to be 81 characters long');
        done();
      });
    });
    // #13
    test('Check a puzzle placement with invalid placement coordinate', function(done) {
      chai.request(server)
      .post('/api/check')
      .send({ puzzle: INVALID_LEN_PUZZLE, coordinate: "A10", value: "2" })
      .end(function(err, res) {
        assert.equal(res.status, 200, 'server response is 200');
        expect(res).to.have.a.property('type').that.equals('application/json');
        expect(res).to.have.a.property('body').that.is.an('object');
        expect(res.body).to.have.a.property('error').that.is.a('string').that
        .equals('Invalid coordinate');
        done();
      });
    });
    // #13
    test('Check a puzzle placement with invalid placement value', function(done) {
      chai.request(server)
      .post('/api/check')
      .send({ puzzle: INVALID_LEN_PUZZLE, coordinate: "A2", value: "12" })
      .end(function(err, res) {
        assert.equal(res.status, 200, 'server response is 200');
        expect(res).to.have.a.property('type').that.equals('application/json');
        expect(res).to.have.a.property('body').that.is.an('object');
        expect(res.body).to.have.a.property('error').that.is.a('string').that
        .equals('Invalid value');
        done();
      });
    });
  });
});

