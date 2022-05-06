// ******************** //
// A dispatcher export which combines all dispatchers to one.
// ******************** //

import eventDispatch from './eventDispatch';
import disconnectDispatch from './disconnectDispatch';
import interDispatch from './interDispatch';

export default {
    eventDispatch,
    disconnectDispatch,
    interDispatch,
};
