import { ChattyServer } from './setupServer';
import express, {Express} from 'express';
import databaseConnection from './setupDatabase';
import { config } from './config';


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
    }
}

const application = new Application();

application.initialize();