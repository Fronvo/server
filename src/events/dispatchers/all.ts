// ******************** //
// A dispatcher export which combines all dispatchers to one.
// ******************** //

import eventDispatch from './eventDispatch';
import disconnectDispatch from './disconnectDispatch';

export default {
    eventDispatch,
    disconnectDispatch,
};
