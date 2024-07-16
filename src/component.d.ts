import { ButtonInteraction, Message, ModalSubmitInteraction, StringSelectMenuInteraction } from "discord.js"
import { LoliBotClient } from "./utils/clients"

export type BaseComponent = {
     name: string
     type: any
     callback: (client: LoliBotClient, interaction: unknown) => Promise<unknown>
}
export type Components = {
     menus: StringSelectMenuComponent[]
     buttons: ButtonStandardComponent[]
     modals: ModalComponent[]
}

export declare interface StringSelectMenuComponent extends BaseComponent {
     callback: (client: LoliBotClient, interaction: StringSelectMenuInteraction, values: string[]) => Promise<unknown>
}

export declare interface ButtonStandardComponent extends BaseComponent {
     callback: (client: LoliBotClient, interaction: ButtonInteraction) => Promise<unknown>
}

export declare interface ModalComponent extends BaseComponent {
     callback: (client: LoliBotClient, interaction: ModalSubmitInteraction) => Promise<unknown>
}
