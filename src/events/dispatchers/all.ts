// ******************** //
// A dispatcher export which combines all dispatchers to one.
// ******************** //

import eventDispatch from './eventDispatch';
import disconnectDispatch from './disconnectDispatch';
import interDispatch from './interDispatch';
import connectDispatch from './connectDispatch';
import connectionErrorDispatch from './connectionErrorDispatch';

export default {
    eventDispatch,
    disconnectDispatch,
    interDispatch,
    connectDispatch,
    connectionErrorDispatch,
};
