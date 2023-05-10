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
import fetchHomePosts from 'test/account/fetchHomePosts.test';
import createRoom from 'test/account/createRoom.test';
import fetchRoomData from 'test/account/fetchRoomData.test';
import updateRoomData from 'test/account/updateRoomData.test';
import joinRoom from 'test/account/joinRoom.test';
import sendRoomMessage from 'test/account/sendRoomMessage.test';
import fetchRoomMessages from 'test/account/fetchRoomMessages.test';
import deleteRoomMessage from 'test/account/deleteRoomMessage.test';
import kickMember from 'test/account/kickMember.test';
import banMember from 'test/account/banMember.test';
import showBannedMembers from 'test/account/showBannedMembers.test';
import unbanMember from 'test/account/unbanMember.test';
import leaveRoom from 'test/account/leaveRoom.test';
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
    fetchHomePosts,
    createRoom,
    fetchRoomData,
    updateRoomData,
    joinRoom,
    sendRoomMessage,
    fetchRoomMessages,
    deleteRoomMessage,
    kickMember,
    banMember,
    showBannedMembers,
    unbanMember,
    leaveRoom,
    logout,
};
