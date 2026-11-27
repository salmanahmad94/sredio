import mongoose from 'mongoose';

import config from '../config';
import logger from '../config/winston';

export default async () => {
    mongoose.connection.on('disconnected', () => {
        logger.warn('Disconnected from MongoDB.', { label: 'APP' });
    });

    mongoose.connection.on('reconnected', () => {
        logger.verbose('Reconnected to MongoDB.', { label: 'APP' });
    });

    // Throws if MongoDB can't be reached, which stops the boot.

    await mongoose.connect(config.mongoose.uri, { serverSelectionTimeoutMS: 5000 });

    logger.verbose(`Connected to MongoDB at ${mongoose.connection.host}.`, { label: 'APP' });

    // Agenda shares this connection.

    return mongoose.connection.db!;
};
