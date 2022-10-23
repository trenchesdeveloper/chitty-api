import mongoose from 'mongoose';
import Logger from 'bunyan';
import { config } from './config';

const log: Logger = config.createLogger('Database');

export default () =>{
    const connect = () => {
        mongoose.connect(config.DATABASE_URL!).then(() => {
            return log.info('Successfully connected to MongoDB');
        }).catch(error => {
            log.error('Error connecting to MongoDB: ', error);
            return process.exit(1);
        });
    };

    connect();

    mongoose.connection.on('disconnected', connect);
};