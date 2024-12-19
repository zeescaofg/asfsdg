const fs = require('fs');
const { Client } = require('discord.js');
const express = require('express');

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

const client = new Client({ partials: ['MESSAGE'] });

const app = express();

app.get('/', (req, res) => {
    res.send('Bot is running!');
});

app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running');
});

client.on('ready', onReady);
client.on('messageReactionAdd', addRole);
client.on('messageReactionRemove', removeRole);

client.login(process.env.BOT_TOKEN);

async function onReady() {
    const channel = client.channels.cache.find((channel) => channel.name === config.channel);

    try {
        await channel.messages.fetch();
    } catch (err) {
        console.error('Error fetching channel messages', err);
        return;
    }

    config.message_id = channel.messages.first().id;

    console.log(`Watching message '${config.message_id}' for reactions...`);
}

async function addRole({ message, _emoji }, user) {
    if (user.bot || message.id !== config.message_id) {
        return;
    }

    if (message.partial) {
        try {
            await message.fetch();
        } catch (err) {
            console.error('Error fetching message', err);
            return;
        }
    }

    const { guild } = message;
    const member = guild.members.cache.get(user.id);
    const role = guild.roles.cache.find((role) => role.name === config.roles[_emoji.name]);

    if (!role) {
        console.error(`Role not found for '${_emoji.name}'`);
        return;
    }

    try {
        await member.roles.add(role.id);
    } catch (err) {
        console.error('Error adding role', err);
    }
}

async function removeRole({ message, _emoji }, user) {
    if (user.bot || message.id !== config.message_id) {
        return;
    }

    if (message.partial) {
        try {
            await message.fetch();
        } catch (err) {
            console.error('Error fetching message', err);
            return;
        }
    }

    const { guild } = message;
    const member = guild.members.cache.get(user.id);
    const role = guild.roles.cache.find((role) => role.name === config.roles[_emoji.name]);

    if (!role) {
        console.error(`Role not found for '${_emoji.name}'`);
        return;
    }

    try {
        await member.roles.remove(role.id);
    } catch (err) {
        console.error('Error removing role', err);
    }
}
