import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip } from "chart.js";

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

export default class OddsChart {
    #oddsChart;

    constructor(htmlElement, diceCount) {
        this.#oddsChart = this.#init(htmlElement, diceCount);
    }

    #init(chartElement, diceCount) {
        return new Chart(chartElement, {
            type: "bar",
            data: {
                datasets: [{
                    backgroundColor: "rgba(147, 51, 234, 1)",
                    categoryPercentage: 1,
                    data: Array(diceCount).fill((1 / diceCount) * 100)
                }],
                labels: Array.from({ length: diceCount }, (_, i) => i + 1)
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
    }

    refreshWith(oddsData) {
        this.#oddsChart.data.labels = Array.from({ length: oddsData.length ?? 0 }, (_, i) => i + 1);
        this.#oddsChart.data.datasets.forEach(dataset => dataset.data = oddsData);
        this.#oddsChart.update();
    }
};