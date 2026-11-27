import type { Agenda } from 'agenda';

import runZap from '../jobs/zaps/runZap';

// Listed explicitly rather than discovered from the folder, so only real job files load.
const definitions = [runZap];

export default async (agenda: Agenda) => {
    definitions.forEach((define) => define(agenda));

    await agenda.start();

    return agenda;
};
