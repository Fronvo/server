// ******************** //
// The account-only function tests for the Fronvo server.
// ******************** //

import fetchProfileId from 'test/account/fetchProfileId.test';
import fetchProfileData from 'test/account/fetchProfileData.test';
import updateProfileData from 'test/account/updateProfileData.test';
import createPost from 'test/account/createPost.test';
import fetchProfilePosts from 'test/account/fetchProfilePosts.test';
import logout from 'test/account/logout.test';

export default {
    fetchProfileId,
    fetchProfileData,
    updateProfileData,
    createPost,
    fetchProfilePosts,
    logout,
};
