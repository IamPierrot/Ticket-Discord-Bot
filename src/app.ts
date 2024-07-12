import { LoliBotClient } from './utils/clients';

const client = LoliBotClient.getInstance();

(async () => {
     await client.start();
})();