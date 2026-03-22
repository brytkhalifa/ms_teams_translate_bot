import { App } from '@microsoft/teams.apps';
import { DevtoolsPlugin } from '@microsoft/teams.dev';
import { composeApp } from './composeApp';

const app = new App({
  plugins: [new DevtoolsPlugin()],
});

composeApp(app);

app.start(process.env.PORT || 3978).catch(console.error);
