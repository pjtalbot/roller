const express = require('express');
const router = new express.Router();
const { checkAuthenticated, checkNotAuthenticated } = require('../helpers/checkAuth');
const passport = require('passport');
const bcrypt = require('bcrypt');
const db = require('../db.js');
const yup = require('yup');

const { getAllConditions, getDescriptionById } = require('../dndapi/dndApi');

const Character = require('../models/Character');
const Card = require('../models/Card');
const { default: axios } = require('axios');

router.get('/:charId', checkAuthenticated, async (req, res, next) => {
	let currentUser = req.session.passport.user;
	let charId = req.params.charId;

	let character = await Character.get(charId);

	let cards = await Card.getAllByCharacter(charId);

	let allConditions = await getAllConditions();

	let conditions = {};

	for (let c of character.conditions) {
		let desc = await getDescriptionById(c);

		let newKey = c.toString();

		conditions[newKey] = desc;
	}

	// TODO: for displaying condition rules
	//

	// let cards = [ { name: 'spell' }, { name: 'spell2' } ];
	// TODO: How to display condition description?
	// pass getDescriptionById function to ejs?

	res.render('pages/character.ejs', {
		character: character,
		currentUser: currentUser,
		cards: cards,
		conditions: conditions,
		allConditions: allConditions
	});
});

router.post('/create/:charId', checkAuthenticated, async (req, res) => {
	// TODO: What was I doing here?
	// Is this route even used?
	let formData = await req.body;

	res.redirect(`room/${formData.name}`);
});

router.post('/delete/:charId', checkAuthenticated, async (req, res) => {
	let charId = req.params.charId;
	console.log(charId);
	let result = await Character.delete(charId);
	console.log(result);
	res.redirect('/user/characters');
});

router.post('/:charId/update/hp', checkAuthenticated, async (req, res) => {
	let charId = req.params.charId;
	let maxHP = req.body.max_hp;
	let result = await Character.setMaxHP(charId, maxHP);

	res.redirect(`/character/${charId}`);
});

router.post('/:charId/update/conditions', checkAuthenticated, async (req, res) => {
	let conditionId = req.body.condition;
	let charId = req.params.charId;
	let result = await Character.addCondition(charId, conditionId);
	res.redirect(`/character/${charId}`);
});

router.post('/:charId/update/abilities', checkAuthenticated, async (req, res) => {
	let charId = req.params.charId;
	let abilityScores = {};
	abilityScores['strength'] = +req.body.strength;
	abilityScores['dexterity'] = +req.body.dexterity;
	abilityScores['constitution'] = +req.body.constitution;
	abilityScores['intelligence'] = +req.body.intelligence;
	abilityScores['wisdom'] = +req.body.wisdom;
	abilityScores['charisma'] = +req.body.charisma;

	await Character.updateAbilityScores(charId, abilityScores);

	console.log('ABILITY SCORES');
	console.log(abilityScores);
	res.redirect(`/character/${charId}`);
});

router.get('/:charId/conditions', checkAuthenticated, async (req, res) => {
	let charId = req.params.charId;

	let conditions = await Character.getConditions(charId);

	// get conditions, ensure conditions is object with key.
	// then query api for desc
	// update each condition with getDescriptionById()
});

router.post('/:charId/add/resistance', checkAuthenticated, async (req, res) => {
	let resistances = req.body.resistances;
	console.log(resistances);
	let charId = req.params.charId;
	let result = await Character.addResistance(charId, resistances);
	res.redirect(`/character/${charId}`);
});

router.post('/:charId/remove/resistance/:resistance', checkAuthenticated, async (req, res) => {
	try {
		// TODO: remove conditions broken
		let resistanceId = req.params.resistance;
		let charId = req.params.charId;
		console.log('******REMOVE RESISTANCE*****');
		// let conditionsArr = await Character
		let result = await Character.removeResistance(charId, resistanceId);
		res.redirect(`/character/${charId}`);
	} catch (e) {
		console.log(e);
	}
});

router.post('/:charId/remove/condition/:condition', checkAuthenticated, async (req, res) => {
	try {
		// TODO: remove conditions broken
		let conditionId = req.params.condition;
		let charId = req.params.charId;
		console.log('******REMOVE CONDITIONS*****');
		// let conditionsArr = await Character
		let result = await Character.removeCondition(charId, conditionId);
		res.redirect(`/character/${charId}`);
	} catch (e) {
		console.log(e);
	}
});

// Removes all conditions
router.post('/:charId/removeAll/conditions', checkAuthenticated, async (req, res) => {
	try {
		// TODO: remove conditions broken
		let conditionId = req.body.condition;
		let charId = req.params.charId;
		console.log('******REMOVE CONDITIONS*****');
		// let conditionsArr = await Character
		let result = await Character.removeAllConditions(charId);
		res.redirect(`/character/${charId}`);
	} catch (e) {
		console.log(e);
	}
});

module.exports = router;
