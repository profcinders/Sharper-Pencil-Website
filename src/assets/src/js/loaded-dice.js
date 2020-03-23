let diceApp = new Vue({
    el: "#diceApp",
    data: {
        diceMultiplier: 1,
        dieSides: 6,
        constantAdditive: 0,
        additiveSign: "+",
        hasRolled: false,
        rollResult: 0,
        rollDetails: ""
    },
    computed: {
        additive() {
            return (this.additiveSign == "-" ? -1 : 1) * this.constantAdditive;
        }
    },
    methods: {
        rollDice() {
            let rolls = [];
            for (let i = 0; i < this.diceMultiplier; i++) {
                rolls.push(this.getRandomInt(1, this.dieSides));
            }

            this.rollResult = rolls.reduce((x, y) => x + y, 0) + this.additive;

            rolls = rolls.map(r =>
                r == 1 ? `<span class="font-bold text-red-600">${r}</span>`
                    : r == this.dieSides ? `<span class="font-bold text-green-700">${r}</span>`
                    : r);
            this.rollDetails = `(${rolls.join(" + ")}) ${this.additiveSign} ${this.constantAdditive}`;

            this.hasRolled = true;
        },
        getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    }
});