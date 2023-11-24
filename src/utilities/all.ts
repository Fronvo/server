// ******************** //
// A utility export which combines all utilities to one.
// ******************** //

import * as utilitiesAll from 'utilities/global';
import * as utilitiesNoAccount from 'utilities/noAccount';
import * as utilitiesGeneral from 'utilities/general';
import * as utilitiesAccount from 'utilities/account';

export default {
    ...utilitiesAll,
    ...utilitiesNoAccount,
    ...utilitiesGeneral,
    ...utilitiesAccount,
};
