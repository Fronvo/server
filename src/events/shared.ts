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
export const profileId: EzierValidatorStringSchema = {
    minLength: 5,
    maxLength: 20,
    regex: /^[a-z0-9._]+$/,
};

export const profileIdSchema: {
    profileId: EzierValidatorStringSchema;
} = {
    profileId,
};

// Room id
const roomId: EzierValidatorStringSchema = {
    type: 'uuid',
};

export const roomIdSchema: {
    roomId: EzierValidatorStringSchema;
} = {
    roomId,
};

// Room name
const roomName: EzierValidatorStringSchema = {
    minLength: 1,
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
        regex: /https:\/\/ik.imagekit.io\/fronvo\/[0-9A-Za-z]{8}-[0-9A-Za-z]{4}-4[0-9A-Za-z]{3}-[89ABab][0-9A-Za-z]{3}-[0-9A-Za-z]{12}.+/,
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
