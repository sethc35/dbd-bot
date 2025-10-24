import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import dotenv from "dotenv";
import fs from "fs/promises";
dotenv.config();

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
const commandFiles = await fs.readdir("./commands");
const commands = [];

for (const file of commandFiles) {
    const { command } = await import(`./commands/${file}`);
    commands.push(command.data);
}

(async () => {
    try {
        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID,
            ),
            { body: commands },
        );

        console.log("Successfully registered application commands.");
    } catch (error) {
        console.error("Error registering commands: " + error);
    }
})();
