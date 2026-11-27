import { MongoBackend } from '@agendajs/mongo-backend';
import { Agenda, InMemoryNotificationChannel } from 'agenda';
import type { mongo } from 'mongoose';

import config from '../config';

export default (db: mongo.Db) =>
    new Agenda({
        backend: new MongoBackend({ mongo: db, collection: config.agenda.collection }),
        // Jobs queued by this process start right away instead of waiting for the next poll.
        notificationChannel: new InMemoryNotificationChannel(),
        processEvery: config.agenda.processEvery,
        maxConcurrency: config.agenda.maxConcurrency
    });
