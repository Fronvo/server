// ******************** //
// The account-only function tests for the Fronvo server.
// ******************** //

import fetchProfileId from 'test/account/fetchProfileId.test';
import fetchProfileData from 'test/account/fetchProfileData.test';
import updateProfileData from 'test/account/updateProfileData.test';
import createPost from 'test/account/createPost.test';
import fetchProfilePosts from 'test/account/fetchProfilePosts.test';
import deletePost from 'test/account/deletePost.test';
import followProfile from 'test/account/followProfile.test';
import unfollowProfile from 'test/account/unfollowProfile.test';
import findProfiles from 'test/account/findProfiles.test';
import logout from 'test/account/logout.test';

export default {
    fetchProfileId,
    fetchProfileData,
    updateProfileData,
    createPost,
    fetchProfilePosts,
    deletePost,
    followProfile,
    unfollowProfile,
    findProfiles,
    logout,
};
