import 'dotenv/config';
import { config } from './config';

import { createApp } from './app';

const app = createApp();

app.listen(config.port, () => {
  console.log(`API running on http://localhost:${config.port}`);
});
