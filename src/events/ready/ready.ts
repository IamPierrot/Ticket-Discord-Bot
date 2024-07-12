import { ActivityOptions, ActivityType } from "discord.js";
import { LoliBotClient } from "../../utils/clients";
import chalk from "chalk";

const status: ActivityOptions[] = [
     {
          name: 'Youtube 🎧',
          type: ActivityType.Streaming,
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
     },
     {
          name: 'Spotify 🎧',
          type: ActivityType.Streaming,
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
     },
     {
          name: 'soundCloud 🎧',
          type: ActivityType.Streaming,
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
     },
]

export = async (client: LoliBotClient) => {

     if (!client.user) throw new Error('Cook');

     setInterval(() => {
          const random = Math.floor(Math.random() * status.length);
          client.user!.setActivity(status[random]);
     }, 10000)

     console.log(chalk.green.bold(`✅ Sucessfully logged into ${chalk.bold.magenta(client.user.tag)}`));
}