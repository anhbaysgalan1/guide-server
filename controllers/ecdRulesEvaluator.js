'use strict';

const rp = require('request-promise');
const parse = require('csv-parse');
const Group = require('../models/Group');
const biologica = require('../shared/biologica.js');
const biologicaX = require('../shared/biologicax.js');


/**
 * This class uses ECD-derived rules to evaluate student moves
 * and to provide move-specific hints.
 */
class EcdRulesEvaluator {
    constructor(csv) {
        this.rules = this.convertCsvToRules(csv);
    }

    updateStudentModelAsync(student, session, event) {
        return new Promise((resolve, reject) => {
            console.info("Update student model for: %s (%s | %s)", student.id, session.groupId, event.context.challengeId);
            var targetSpecies = BioLogica.Species[event.context.species];

            // Iterate over the genes that are editable by the student in the UI
            var conceptIdToTrait = {};
            var genesLength = event.context.editableGenes.length;
            for (var i = 0; i < genesLength; ++i) {
                var gene = event.context.editableGenes[i];
                var alleleA = BiologicaX.findAllele(targetSpecies, event.context.selectedAlleles, 'a', gene).replace('a:', '');
                var alleleB = BiologicaX.findAllele(targetSpecies, event.context.selectedAlleles, 'b', gene).replace('b:', '');
                var targetCharacteristic = BiologicaX.getCharacteristicFromPhenotype(event.context.correctPhenotype, gene);

                console.info("Update: " + targetCharacteristic);

                //updateStudentModel(conceptMatrix, targetCharacteristic, alleleA, alleleB, student);
            }

            resolve(this);
        });
    }

    getHintAsync(student, session, event) {
        return new Promise((resolve, reject) => {
            console.info("Find hint for: %s (%s | %s)", student.id, session.groupId, event.context.challengeId);
            var text =  "Let's look at the metallic gene. What alleles must be added to the parents' gametes so that the offspring drake is metallic?";
            var dialogMessage = new GuideProtocol.Text(
                'ITS.CONCEPT.FEEDBACK',
                text);
            //dialogMessage.args.trait = trait;

            resolve(dialogMessage);
        });
    }

    convertCsvToRules(csv) {
        var rules = [];

        var headerRow = csv[0];
        var columnCount = csv[0].length;
        var rowCount = csv.length;
        for (var i = 1; i < rowCount; ++i) {
            var currentRow = csv[i];
            var newRule = 
            {
                conceptModifiers: {},
                hints: []
            };
            for (var j = 0; j < columnCount; ++j) {
                var columnName = headerRow[j];
                var value = currentRow[j].trim();
                if (this.isConceptId(columnName)) {
                    newRule.conceptModifiers[columnName] = (value ? Number(value) : 0);
                } else if (this.isHint(columnName)) {
                    newRule.hints.push(value);
                } else {
                    newRule[columnName.toLowerCase()] = value;
                }
            }
            rules.push(newRule);
        }

        return rules;
    }

    isConceptId(text) {
        var target = text.toLowerCase();

        if (target.includes("inheritancepattern")
            || target.includes("target")
            || target.includes("allele")
            || target.includes("hint")
            || target.includes("note")
            || target.includes("comment")) {
                return false;
            }

            return true;
    }

    isHint(text) {
        var target = text.toLowerCase();
        return target.includes("hint");
    }
}

module.exports = EcdRulesEvaluator;