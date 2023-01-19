import { createApp } from "vue";
import OddsChart from "./loaded-dice-app/OddsChart"

let oddsChart = null;

createApp({
    data() {
        return {
            dice: {
                diceMultiplier: 1,
                dieSides: 6,
                constantAdditive: 0,
                additiveSign: "+",
                additive: 0,
                hasRolled: false,
                rollResult: 0,
                rollDetails: "",
                weighted: false,
                rollWeights: Array(100).fill(1),
                lastRollWeighted: false
            },
            options: {
                toggleCaret: "&#x2bc6;",
                show: false
            }
        };
    },
    computed: {
        activeRollWeights() {
            return this.dice.rollWeights.slice(0, this.dice.dieSides ?? 0);
        },
        totalWeight() {
            return this.sumArray(this.activeRollWeights);
        }
    },
    watch: {
        "dice.constantAdditive"() {
            this.calculateAdditive();
        },
        "dice.additiveSign"() {
            this.calculateAdditive();
        },
        "dice.weighted"() {
            this.updateOddsChart();
        },
        activeRollWeights() {
            this.updateOddsChart();
        }
    },
    mounted() {
        oddsChart = new OddsChart(document.getElementById('oddsChart'), 6);
    },
    methods: {
        rollDice() {
            if (this.dice.weighted) {
                this.rollWeightedDice();
                return;
            }

            let rolls = [];
            for (let i = 0; i < this.dice.diceMultiplier; i++) {
                rolls.push(this.getRandomInt(1, this.dice.dieSides));
            }

            this.setRollResults(rolls, false);
        },
        rollWeightedDice() {
            if (!this.dice.weighted) {
                this.rollDice();
                return;
            }

            let possibleRolls = [];
            for (let [i, weight] of this.activeRollWeights.entries()) {
                for (let w = 0; w < weight; w++) {
                    possibleRolls.push(i + 1);
                }
            }

            let rolls = [];
            for (let i = 0; i < this.dice.diceMultiplier; i++) {
                rolls.push(possibleRolls[this.getRandomInt(0, possibleRolls.length - 1)]);
            }

            this.setRollResults(rolls, true);
        },
        setRollResults(rolls, weighted) {
            this.dice.rollResult = this.sumArray(rolls) + this.dice.additive;

            rolls = rolls.map(r =>
                r == 1 ? `<span class="font-bold text-red-600">${r}</span>`
                    : r == this.dice.dieSides ? `<span class="font-bold text-green-700">${r}</span>`
                        : r);
            this.dice.rollDetails = `(${rolls.join(" + ")}) ${this.dice.additiveSign} ${this.dice.constantAdditive}`;

            this.dice.hasRolled = true;
            this.dice.lastRollWeighted = weighted;
        },
        calculateAdditive() {
            this.dice.additive = (this.dice.additiveSign == "-" ? -1 : 1) * this.dice.constantAdditive;
        },
        toggleOptions() {
            this.options.show = !this.options.show;
            if (this.options.show) {
                this.options.toggleCaret = "&#x2bc5;";
            } else {
                this.options.toggleCaret = "&#x2bc6;";
            }
        },
        updateOddsChart() {
            let newData = [];
            if (this.dice.weighted) {
                const divisor = this.totalWeight;
                for (let w of this.activeRollWeights) {
                    newData.push((w / divisor) * 100);
                }
            } else {
                let flooredSides = Math.trunc(this.dice.dieSides);
                for (let i = 0; i < flooredSides; i++) {
                    newData.push((1 / flooredSides) * 100);
                }
            }

            oddsChart.refreshWith(newData);
        },
        resetWeights() {
            this.dice.rollWeights = Array(Math.max(100, this.dice.dieSides ?? 0)).fill(1);
        },
        getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        sumArray(arr) {
            return arr.reduce((x, y) => parseInt(x) + parseInt(y), 0);
        }
    }
}).mount("#diceApp");