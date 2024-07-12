declare interface Config extends Readonly<Record<string, unknown>> {
     readonly MONGO: string
     readonly app: Readonly<{
          token: string;
          global: boolean;
          guild: string;
          ExtraMessages: boolean;
          loopMessage: boolean;
          client: string;
          prefix: string;
     }>;
     readonly opt: Readonly<{
          idDev: string[];
     }>;
}

declare var configure: Config;