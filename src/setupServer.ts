import {
  Application,
  json,
  urlencoded,
  Request,
  Response,
  NextFunction,
} from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import compression from 'compression';
import cookieSession from 'cookie-session';
import HTTP_STATUS from 'http-status-codes';
import { Server } from 'socket.io';
import Logger from 'bunyan';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import 'express-async-errors';
import { CustomError, IErrorResponse } from '@globals/helpers/error-handler';
import { config } from '@root/config';
import applicationRoutes from '@root/routes';

const SERVER_PORT = 8000;
const log:Logger = config.createLogger('Server');

export class ChattyServer {
  private app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  public start(): void {
    this.securityMiddleware(this.app);
    this.standardMiddleware(this.app);
    this.routeMiddleware(this.app);
    this.globalErrorHandler(this.app);
    this.startServer(this.app);
  }

  private securityMiddleware(app: Application): void {
    app.use(
      cookieSession({
        name: 'session',
        keys: [config.SECRET_ONE!, 'key2'],
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: config.NODE_ENV !== 'development',
      })
    );

    app.use(hpp());
    app.use(helmet());
    app.use(
      cors({
        origin: '*',
        credentials: true,
        optionsSuccessStatus: 200,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      })
    );
  }

  private standardMiddleware(app: Application): void {
    app.use(compression());
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true }));
  }

  private routeMiddleware(app: Application): void {
    applicationRoutes(app);
  }

  private globalErrorHandler(app: Application): void {
    app.all('*', (req: Request, res: Response, next: NextFunction): void => {
      const error: Error = new Error('Not Found');
      next(error);
    });

    app.use(
      (
        error: IErrorResponse,
        _req: Request,
        res: Response,
        next: NextFunction
      ) => {
        log.error(error);
        if (error instanceof CustomError) {
          return res.status(error.statusCode).json(error.serializeErrors());
        }
        next();
      }
    );
  }

  private async startServer(app: Application): Promise<void> {
    try {
      const httpServer: http.Server = new http.Server(app);
      const socketIO = await this.createSocketIO(httpServer);
      this.socketIOConnections(socketIO);
      this.createSocketIO(httpServer);
      this.startHttpServer(httpServer);
    } catch (error) {
     log.error(error);
    }
  }

  private async createSocketIO(httpServer: http.Server): Promise<Server> {
    const io: Server = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      },
    });

    const pubClient = createClient({
      url: config.REDIS_HOST!,
    });

    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);

    io.adapter(createAdapter(pubClient, subClient));

    return io;
  }

  private startHttpServer(httpServer: http.Server): void {
    log.info('Starting server...on ' + process.pid);
    httpServer.listen(SERVER_PORT, () => {
      log.info(`Server is listening on port ${SERVER_PORT}`);
    });
  }

  private socketIOConnections(io: Server): void {
		log.info('SocketIO Connections');
	}
}

