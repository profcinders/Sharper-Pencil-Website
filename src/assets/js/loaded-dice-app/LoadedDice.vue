<template>
    <div class="flex items-baseline justify-center mb-3">
        <input
            class="border border-gray-400 hover:border-gray-500 focus:border-gray-500 rounded shadow-inner w-16 pl-3 pr-1 py-1 mr-3"
            type="number" step="1" min="1" placeholder="X" v-model="dice.diceMultiplier">
        <div class="border border-r-0 border-gray-400 rounded-l px-3 py-1">d</div>
        <input
            class="border border-gray-400 hover:border-gray-500 focus:border-gray-500 rounded-r shadow-inner w-16 pl-3 pr-1 py-1 mr-3"
            type="number" step="1" min="2" max="100" placeholder="N" v-model="dice.dieSides">
        <div class="relative">
            <select
                class="appearance-none border border-r-0 border-gray-400 hover:border-gray-500 focus:border-gray-500 rounded-l py-1 pl-2 pr-8 w-full"
                v-model="dice.additiveSign">
                <option value="+">+</option>
                <option value="-">-</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-purple-600">
                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"></path>
                </svg>
            </div>
        </div>
        <input
            class="border border-gray-400 hover:border-gray-500 focus:border-gray-500 rounded-r shadow-inner w-16 pl-3 pr-1 py-1"
            type="number" step="1" min="0" placeholder="c" v-model="dice.constantAdditive">
    </div>
    <div class="flex flex-col">
        <button class="text-purple-600 underline mb-3" @click.prevent="toggleOptions">Options <span v-html="options.toggleCaret"></span></button>

        <div class="overflow-hidden" :class="options.show ? null : 'h-0'">
            <div class="flex items-center justify-center mb-3">
                <input type="checkbox" id="dice.weighted" class="mr-3" v-model="dice.weighted">
                <label for="dice.weighted">Weighted</label>
            </div>
            <div class="w-1/2 lg:w-1/3 mx-auto mb-3">
                <canvas id="oddsChart" width="400" height="300"></canvas>
            </div>
            <div class="flex justify-center overflow-hidden mb-3" :class="dice.weighted ? null : 'h-0'">
                <button class="px-5 py-1 rounded-full bg-gray-300 border border-gray-400" @click.prevent="resetWeights">Reset all weights</button>
            </div>
            <div class="flex flex-wrap justify-center overflow-hidden mb-3" :class="dice.weighted ? null : 'h-0'">
                <div v-for="index in parseInt(dice.dieSides)" class="m-3">
                    <label>{{ index }}:</label>
                    <input
                        class="border border-gray-400 hover:border-gray-500 focus:border-gray-500 rounded-r shadow-inner w-16 pl-3 pr-1 py-1"
                        type="number" step="1" min="0" max="10" v-model="dice.rollWeights[index - 1]">
                </div>
            </div>
        </div>
    </div>
    <div class="flex items-baseline justify-center mb-3">
        <button class="px-5 py-1 rounded-full bg-purple-600 text-white" @click.prevent="rollDice">Roll</button>
    </div>
    <p class="text-center" v-if="!dice.hasRolled">Roll the dice!</p>
    <div v-else>
        <p class="text-center">
            You rolled:
            <span class="text-2xl font-semibold text-purple-600">{{ dice.rollResult }}</span>
        </p>
        <p class="text-center" v-html="dice.rollDetails"></p>
        <p class="text-center font-semibold" v-show="dice.lastRollWeighted">Weighted</p>
    </div>
</template>

<script>
import OddsChart from "./OddsChart"

let oddsChart = null;

export default {
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
};
</script>