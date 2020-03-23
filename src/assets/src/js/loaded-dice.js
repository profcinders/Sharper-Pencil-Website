let diceApp = new Vue({
    el: "#diceApp",
    data: {
        diceMultiplier: 1,
        dieSides: 6,
        constantAdditive: 0,
        additiveSign: "+",
        hasRolled: false,
        rollResult: 0
    },
    computed: {
        additive() {
            return (this.additiveSign == "-" ? -1 : 1) * this.constantAdditive;
        }
    },
    methods: {
        rollDice() {
            let totalRoll = 0;
            for (let i = 0; i < this.diceMultiplier; i++) {
                totalRoll += this.getRandomInt(1, this.dieSides);
            }

            this.rollResult = totalRoll + this.additive;
            this.hasRolled = true;
        },
        getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    }
});