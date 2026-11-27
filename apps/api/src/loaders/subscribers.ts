import updateLastLogin from '../subscribers/auth/updateLastLogin';
import recordRun from '../subscribers/zaps/recordRun';

// Listed explicitly rather than discovered from the folder, so only real subscribers load.
const subscribers = [updateLastLogin, recordRun];

export default () => {
    subscribers.forEach((subscribe) => subscribe());
};
