// ******************** //
// Shared variables for the account-only event files.
// ******************** //

import { EzierValidatorStringSchema } from '@ezier/validate';

type fromTo = 'from' | 'to';

export const emailSchema: {
    email: EzierValidatorStringSchema;
} = {
    email: {
        minLength: 8,
        maxLength: 120,
        type: 'email',
    },
};

export const passwordSchema: {
    password: EzierValidatorStringSchema;
} = {
    password: {
        minLength: 8,
        maxLength: 90,
    },
};

// Profile id
const profileId: EzierValidatorStringSchema = {
    minLength: 5,
    maxLength: 30,
    regex: /^[a-z0-9.]+$/,
};

export const profileIdSchema: {
    profileId: EzierValidatorStringSchema;
} = {
    profileId,
};

export const profileIdSearchSchema: {
    profileId: EzierValidatorStringSchema;
} = {
    profileId: {
        ...profileId,
        minLength: 1,
    },
};

export const profileIdOptionalSchema: {
    profileId: EzierValidatorStringSchema;
} = {
    profileId: {
        ...profileId,
        optional: true,
    },
};

// Room id
const roomId: EzierValidatorStringSchema = {
    minLength: 2,
    maxLength: 15,
    regex: /^[a-z0-9]+$/,
};

export const roomIdSchema: {
    roomId: EzierValidatorStringSchema;
} = {
    roomId,
};

export const roomIdOptionalSchema: {
    roomId: EzierValidatorStringSchema;
} = {
    roomId: {
        ...roomId,
        optional: true,
    },
};

// Room name
const roomName: EzierValidatorStringSchema = {
    minLength: 2,
    maxLength: 15,
};

export const roomNameSchema: {
    name: EzierValidatorStringSchema;
} = {
    name: roomName,
};

export const roomNameOptionalSchema: {
    name: EzierValidatorStringSchema;
} = {
    name: {
        ...roomName,
        optional: true,
    },
};

export const roomIconSchema: {
    icon: EzierValidatorStringSchema;
} = {
    icon: {
        // Ensure https
        regex: /^(https:\/\/).+$/,
        maxLength: 512,
        optional: true,
    },
};

export const fromToSchema: {
    [key in fromTo]: EzierValidatorStringSchema;
} = {
    from: {
        minLength: 1,
        maxLength: 7,
        regex: /^[0-9]+$/,
    },

    to: {
        minLength: 1,
        maxLength: 7,
        regex: /^[0-9]+$/,
    },
};

export const maxResultsSchema: {
    maxResults: EzierValidatorStringSchema;
} = {
    maxResults: {
        minLength: 1,
        maxLength: 3,
        regex: /^[0-9]+$/,
        optional: true,
    },
};
