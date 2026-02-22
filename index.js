require("dotenv").config();
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const { RustPlus } = require("@liamcottle/rustplus.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

let rustplus;

function connectRustPlus() {
  rustplus = new RustPlus(
    process.env.RUST_SERVER_IP,
    parseInt(process.env.RUST_SERVER_PORT),
    process.env.RUST_PLAYER_ID,
    parseInt(process.env.RUST_PLAYER_TOKEN)
  );

  rustplus.on("connected", () => {
    console.log("✅ Rust+ csatlakozva");

    rustplus.subscribeToEntity(process.env.ALARM_ENTITY_ID);
  });

  rustplus.on("disconnected", () => {
    console.log("❌ Rust+ kapcsolat megszakadt, újracsatlakozás 10 mp múlva...");
    setTimeout(connectRustPlus, 10000);
  });

  rustplus.on("entityChanged", async (entity) => {
    if (entity.payload?.value === 1) {
      console.log("🚨 RAID ALARM AKTÍV!");

      const channel = await client.channels.fetch(process.env.CHANNEL_ID);

      const embed = new EmbedBuilder()
        .setTitle("🚨 RAID ALARM 🚨")
        .setDescription("💣 A Smart Alarm aktiválódott!")
        .setColor(0xff0000)
        .setTimestamp();

      await channel.send({
        content: `<@&${process.env.ROLE_ID}>`,
        embeds: [embed]
      });
    }
  });

  rustplus.connect();
}

client.once("ready", () => {
  console.log(`🤖 Discord online: ${client.user.tag}`);
  connectRustPlus();
});

client.login(process.env.TOKEN);
