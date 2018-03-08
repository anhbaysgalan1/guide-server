'use strict';

const EcdRuleCondition = require('./ecdRuleCondition');
const TraitCondition = require('./ecdRuleCondition').TraitCondition;
const _ = require('lodash');

class EcdRule {   
    constructor(source, id, priority, conditions, isCorrect, concepts, hints) {
        this.source = source;
        this.id = id;
        this.priority = priority;
        this.conditions = conditions;
        this.concepts = concepts;
        this.hints = hints;
        this.trait = null;
        this.isCorrect = isCorrect;

        if (!this.conditions || this.conditions.length == 0) {
            throw new Error("No conditions defined for ECD rule.")
        }

        let traits = [];
        this.conditions.forEach((condition) => {
            if (condition.isUserSelection && condition.trait) {
                traits.push(condition.trait);
            }
        });

        traits = _.uniq(traits);
        if (traits.length > 1) {
            this.trait = traits.join(",");
        } else if (traits.length == 1) {
            this.trait = traits[0];
        } else {
            this.trait = "unknown";
        }
    }

    evaluate(event) {

        let allConditionsMatched = this.conditions.every((condition) => {
            let result = condition.evaluate(event);
            return result;
        });

        return allConditionsMatched;
    }

    conditionsAsString(conditions) {
        let s = "";
        let prependAnd = false;
        this.conditions.forEach((condition) => {
            if (prependAnd) {
                s += " && ";
            }
            s += condition.description();
            prependAnd = true;
        });

        return s;
    }
}

module.exports = EcdRule;