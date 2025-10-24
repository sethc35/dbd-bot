import { SlashCommandBuilder } from "@discordjs/builders";

const rankMapping = {
    'Gold 1': 3000,
    'Gold 2': 3500,
    'Gold 3': 4000,
    'Diamond 1': 4500,
    'Diamond 2': 5000,
    'Diamond 3': 5500,
    'Mythic 1': 6000,
    'Mythic 2': 6500,
    'Mythic 3': 7000,
    'Legendary 1': 7500,
    'Legendary 2': 8000,
    'Legendary 3': 8500,
    'Masters': 9000
};

export const command = {
    data: new SlashCommandBuilder()
        .setName("calculate")
        .setDescription("Calculates the cost between two trophy ranges")
        .addStringOption(option =>
        option.setName("start")
                .setDescription("The starting rank or trophy count")
                .setAutocomplete(true)
                .setRequired(true))
        .addStringOption(option =>
        option.setName("end")
                .setDescription("The ending rank or trophy count")
                .setAutocomplete(true)
                .setRequired(true))
        .addBooleanOption(option =>
        option.setName("ranked")
                .setDescription("Select true for ranked calculation, false for ladder")
                .setRequired(false))
        .addBooleanOption(option =>
        option.setName("carry")
                .setDescription("Include carry service (optional)")
                .setRequired(false))
        .toJSON(),
    restricted: true,
    /**
     * @param {import("discord.js").CommandInteraction} interaction
     */
    async callback(interaction) {
        const startInput = interaction.options.getString("start", true);
        const endInput = interaction.options.getString("end", true);

        const startIsRank = rankMapping.hasOwnProperty(startInput);
        const endIsRank = rankMapping.hasOwnProperty(endInput);

        let isRanked = interaction.options.getBoolean("ranked");

        if (isRanked === null && (startIsRank || endIsRank)) {
            isRanked = true;
        } else if (isRanked === null) {
            isRanked = false;
        }
    
        const carry = interaction.options.getBoolean("carry") || false;
        
        let startTrophies, endTrophies;
        if (startIsRank) {
            startTrophies = rankMapping[startInput];
        } else {
            startTrophies = parseInt(startInput);
            if (isNaN(startTrophies)) {
                await interaction.reply({
                    content: "The start trophy count or rank you entered is not recognized.",
                });
                return;
            }
        }
    
        if (endIsRank) {
            endTrophies = rankMapping[endInput];
        } else {
            endTrophies = parseInt(endInput);
            if (isNaN(endTrophies)) {
                await interaction.reply({
                    content: "The end trophy count or rank you entered is not recognized.",
                });
                return;
            }
        }
    
        let price = 0;
        if (isRanked) {
            price = carry ? calculateRankCarryingPrice(startTrophies, endTrophies) : calculateRankPrice(startTrophies, endTrophies);
        } else {
            price = carry ? calculateTrCarryPrice(startTrophies, endTrophies) : calculateTrPrice(startTrophies, endTrophies);
        }
    
        try {
            if (price == 0) {
                await interaction.reply({
                    content: `It seems we miscalculated your order, sorry about that. We will try again shortly.`
                });
                return;
            }
    
            await interaction.reply({
                content: `The total price for your order is ${price} dollars.`
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: "An error occurred while calculating the price.",
            });
        }
    },    
    async autocompleteHandler(interaction) {
        const focusedOption = interaction.options.getFocused(true);
        const choices = Object.keys(rankMapping);
        const filtered = choices.filter(choice => choice.toLowerCase().includes(focusedOption.value.toLowerCase()));
        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice }))
        );
    },
};

function calculateTrPrice(startTrophies, endTrophies) {
    let ranges = [];
    for (let start = 0; start < 800; start += 50) {
        ranges.push({ start: start, end: start + 50, cost: 1 });
    }

    ranges = ranges.concat([
        { start: 800, end: 850, cost: 2 },
        { start: 850, end: 900, cost: 3 },
        { start: 900, end: 950, cost: 4 },
        { start: 950, end: 1000, cost: 5 },
        { start: 1000, end: 1050, cost: 7 },
        { start: 1050, end: 1100, cost: 8 },
        { start: 1100, end: 1150, cost: 9 },
        { start: 1150, end: 1200, cost: 10 },
        { start: 1200, end: 1250, cost: 11 },
        { start: 1250, end: 1300, cost: 13 },
        { start: 1300, end: 1350, cost: 14 },
        { start: 1350, end: 1400, cost: 15 },
        { start: 1400, end: 1450, cost: 16 },
        { start: 1450, end: 1500, cost: 17 }
    ]);

    let remainderTo50 = startTrophies % 50;
    if (remainderTo50 >= 40) {
        startTrophies += (50 - remainderTo50);
    } else {
        startTrophies -= remainderTo50;
    }

    let totalCost = 0;
    ranges.forEach(range => {
        if (endTrophies > range.start && startTrophies < range.end) {
            const overlapStart = Math.max(startTrophies, range.start);
            const overlapEnd = Math.min(endTrophies, range.end);
            const overlapRange = overlapEnd - overlapStart;
            const rangeSize = range.end - range.start;
            totalCost += (overlapRange / rangeSize) * range.cost;
        }
    });

    return totalCost;
}

function calculateTrCarryPrice(startTrophies, endTrophies) {
    return 2 * calculateTrPrice(startTrophies, endTrophies);
}

function calculateRankPrice(startTrophies, endTrophies) {
    const rankRanges = [
        { start: 3000, end: 3500, cost: 2 },
        { start: 3500, end: 4000, cost: 2 },
        { start: 4000, end: 4500, cost: 2 },
        { start: 4500, end: 5000, cost: 3 },
        { start: 5000, end: 5500, cost: 3 },
        { start: 5500, end: 6000, cost: 4 },
        { start: 6000, end: 6500, cost: 5 },
        { start: 6500, end: 7000, cost: 10 },
        { start: 7000, end: 7500, cost: 15 },
        { start: 7500, end: 8000, cost: 20 },
        { start: 8000, end: 8500, cost: 25 },
        { start: 8500, end: 9000, cost: 30 }
    ];

    let adjustedStartTrophies = startTrophies;
    let remainderTo100 = startTrophies % 100;
    let differenceToNext100 = 100 - remainderTo100;

    if (remainderTo100 >= 40) {
        adjustedStartTrophies += differenceToNext100;
    } else {
        adjustedStartTrophies -= remainderTo100;
    }

    let totalCost = 0;

    rankRanges.forEach(range => {
        if (adjustedStartTrophies < range.end && endTrophies > range.start) {
            const overlapStart = Math.max(adjustedStartTrophies, range.start);
            const overlapEnd = Math.min(endTrophies, range.end);
            const overlapRange = overlapEnd - overlapStart;
            totalCost += Math.ceil((overlapRange / (range.end - range.start)) * range.cost);
        }
    });

    return totalCost;
}

function calculateRankCarryingPrice(startTrophies, endTrophies) {
    return 2 * calculateRankPrice(startTrophies, endTrophies);
}