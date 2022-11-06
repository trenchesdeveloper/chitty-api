import { ChattyServer } from '@root/setupServer';
import express, {Express} from 'express';
import databaseConnection from '@root/setupDatabase';
import { config } from '@root/config';


class Application {
    public initialize(): void {
        this.loadConfig();
        databaseConnection();
        const app:Express = express();
        const server = new ChattyServer(app);

        server.start();
    }

    private loadConfig(): void {
        config.validateConfig();
				config.cloudinaryConfig();
    }
}

const application = new Application();

application.initialize();
