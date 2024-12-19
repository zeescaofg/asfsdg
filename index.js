const fs = require('fs');
const { Client, GatewayIntentBits } = require('discord.js');

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.Reactions
    ],
    partials: ['MESSAGE', 'REACTION']
});

client.on('ready', onReady);
client.on('messageReactionAdd', addRole);
client.on('messageReactionRemove', removeRole);

client.login(process.env.BOT_TOKEN);

async function onReady() {
    const channel = await client.channels.fetch(config.channel);

    try {
        const messages = await channel.messages.fetch();
        config.message_id = messages.first().id;
        console.log(`Watching message '${config.message_id}' for reactions...`);
    } catch (err) {
        console.error('Error fetching channel messages', err);
    }
}

async function addRole(reaction, user) {
    if (user.bot || reaction.message.id !== config.message_id) {
        return;
    }

    const { message, emoji } = reaction;
    const { guild } = message;

    const member = await guild.members.fetch(user.id);
    const role = guild.roles.cache.find((role) => role.name === config.roles[emoji.name]);

    if (!role) {
        console.error(`Role not found for '${emoji.name}'`);
        return;
    }

    try {
        await member.roles.add(role.id);
    } catch (err) {
        console.error('Error adding role', err);
    }
}

async function removeRole(reaction, user) {
    if (user.bot || reaction.message.id !== config.message_id) {
        return;
    }

    const { message, emoji } = reaction;
    const { guild } = message;

    const member = await guild.members.fetch(user.id);
    const role = guild.roles.cache.find((role) => role.name === config.roles[emoji.name]);

    if (!role) {
        console.error(`Role not found for '${emoji.name}'`);
        return;
    }

    try {
        await member.roles.remove(role.id);
    } catch (err) {
        console.error('Error removing role', err);
    }
}
