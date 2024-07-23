import { Client, ClientOptions, Collection, GatewayIntentBits, Message, Partials, StringSelectMenuBuilder } from "discord.js";
import * as path from 'path';
import { PrefixCommands, SlashCommands } from "../cmds";
import prefixModel from "../database/models/prefixModel";
import sourceEmoji from "../data/emoji.json";
import { Components } from "../component";
import { mongoSetup } from "../database/database";
import eventHandlers from '../handlers/eventHandler';
import { dynamicImportModule, getAllFiles } from "./functions";

globalThis.configure = require('../../config.json');


export class LoliBotClient extends Client {
     cooldowns: Collection<string, Collection<string, number>> = new Collection();
     categoryName: Collection<string, string> = new Collection();

     readonly prefixCommands: PrefixCommands[] = [];
     readonly slashCommands: SlashCommands[] = [];
     readonly events = [];

     readonly prefix: string;
     readonly components: Components = {
          menus: [],
          buttons: [],
          modals: []
     };
     readonly customEmoji;

     private static instance: LoliBotClient = new LoliBotClient({
          intents: Object.keys(GatewayIntentBits) as keyof object,
          partials: Object.keys(Partials) as keyof object
     });

     private constructor(clientOptions: ClientOptions) {
          super(clientOptions);

          this.customEmoji = sourceEmoji;
          this.prefix = (configure.app.prefix);
     }

     public static getInstance() {
          return LoliBotClient.instance;
     }

     public async start() {
          try {
               await mongoSetup(),
                    await Promise.all([
                         eventHandlers(this),
                         this.getTextCommands(),
                         this.getSlashCommands(),
                         this.getComponents()
                    ]);
               await this.login(configure.app.token);
          } catch (error) {
               console.log(error);
          }
     }

     ////////////////////////// Root functions
     public async getTotalGuild() {
          const guild = await this.shard?.fetchClientValues('guilds.cache.size') as unknown as number[];
          return guild?.reduce((total, guildacc) => total + guildacc, 0);
     }
     public async getTotalMember() {
          const member = await this.shard?.broadcastEval(c => c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0));
          return member?.reduce((total, mem) => total + mem, 0)!;
     }

     private async getTextCommands(exceptions: string[] = []) {
          const commandCategories = getAllFiles(
               path.join(__dirname, '..', 'prefixCmds'),
               true
          );
          await Promise.all(commandCategories.map(async commandCategory => {
               const commandFiles = getAllFiles(commandCategory);

               const commandObjects: PrefixCommands[] = await Promise.all(commandFiles.map(file => dynamicImportModule(file)));
               for (const commandObject of commandObjects) {
                    if (exceptions.includes(commandObject.name)) continue;
                    this.prefixCommands.push(commandObject);
               }

          }));
     }

     private async getSlashCommands(exceptions: string[] = []) {
          const commandCategories = getAllFiles(
               path.join(__dirname, '..', 'commands'), true);

          await Promise.all(commandCategories.map(async commandCategory => {
               const commandFiles = getAllFiles(commandCategory);
               //     const commandCategoryName = commandCategory.replace(/\\/g, '/').split('/').pop();

               const commandObjects: SlashCommands[] = await Promise.all(commandFiles.map(file => dynamicImportModule(file)));
               for (const commandObject of commandObjects) {
                    if (exceptions.includes(commandObject.name)) continue;
                    this.slashCommands.push(commandObject);
               }

          }));
     }

     private async getComponents(exceptions: string[] = []) {
          const componentsCategories = getAllFiles(
               path.join(__dirname, '..', 'components'),
               true
          );
          await Promise.all(componentsCategories.map(async componentsCategory => {
               const componentFiles = getAllFiles(componentsCategory);
               const componentName = componentsCategory.replace(/\\/g, '/').split('/').pop();

               const componentObjects = await Promise.all(componentFiles.map(file => dynamicImportModule(file)));
               switch (componentName) {
                    case "menu":
                         this.components.menus = componentObjects;
                         break;
                    case "button":
                         this.components.buttons = componentObjects;
                         break;
                    case "modal":
                         this.components.modals = componentObjects;
                         break;
                    default:
                         break;
               }
          }));
     }

     public async getPrefix(guildId: string) {
          const prefixData = await prefixModel.findOne({ guildId: guildId });
          if (!prefixData) return null;
          return prefixData.prefix;
     }

     ///////////////////////////////////////////
}

