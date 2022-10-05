// ******************** //
// A dispatcher export which combines all dispatchers to one.
// ******************** //

import eventDispatch from './eventDispatch';
import disconnectDispatch from './disconnectDispatch';
import connectDispatch from './connectDispatch';
import connectionErrorDispatch from './connectionErrorDispatch';

export default {
    eventDispatch,
    disconnectDispatch,
    connectDispatch,
    connectionErrorDispatch,
};
