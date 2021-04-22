let diceApp = new Vue({
    el: "#diceApp",
    mounted() {
        let chartEl = document.getElementById('oddsChart');
        this.options.oddsChart = new Chart(chartEl, {
            type: "bar",
            data: {
                datasets: [{
                    backgroundColor: "rgba(124, 58, 237, 1)",
                    categoryPercentage: 1,
                    data: Array(6).fill((1 / 6) * 100)
                }],
                labels: ["1", "2", "3", "4", "5", "6"]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return Math.round((value + Number.EPSILON) * 100) / 100 + '%';
                            },
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || "";
                                label += (label ? ": " : "") + (Math.round((context.raw + Number.EPSILON) * 100) / 100) + "%";
                                return label;
                            }
                        }
                    }
                }
            }
        });
    },
    data: {
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
            show: false,
            oddsChart: null
        }
    },
    computed: {
        activeRollWeights() {
            return this.dice.rollWeights.slice(0, this.dice.dieSides);
        },
        totalWeight() {
            return this.sumArray(this.activeRollWeights);
        }
    },
    watch: {
        "dice.constantAdditive": function () {
            this.calculateAdditive();
        },
        "dice.additiveSign": function () {
            this.calculateAdditive();
        },
        "dice.weighted": function () {
            this.updateOddsChart();
        },
        "activeRollWeights": function () {
            this.updateOddsChart();
        }
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
            let newLabels = Array.from({ length: this.dice.dieSides }, (v, i) => i + 1);

            if (this.dice.weighted) {
                const divisor = this.totalWeight;
                for (let w of this.activeRollWeights) {
                    newData.push((w / divisor) * 100);
                }
            } else {
                for (let i = 0; i < newLabels.length; i++) {
                    newData.push((1 / newLabels.length) * 100);
                }
            }

            this.options.oddsChart.data.labels = newLabels;
            this.options.oddsChart.data.datasets.forEach((dataset) => {
                dataset.data = newData;
            });
            this.options.oddsChart.update();
        },
        resetWeights() {
            this.dice.rollWeights = Array(100).fill(1);
        },
        getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        sumArray(arr) {
            return arr.reduce((x, y) => parseInt(x) + parseInt(y), 0);
        }
    }
});