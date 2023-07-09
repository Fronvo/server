// ******************** //
// Events which are only usable while logged in.
// ******************** //

import fetchProfileId from 'events/account/fetchProfileId';
import fetchProfileData from 'events/account/fetchProfileData';
import logout from 'events/account/logout';
import updateProfileData from 'events/account/updateProfileData';
import createRoom from 'events/account/createRoom';
import updateRoomData from 'events/account/updateRoomData';
import leaveRoom from 'events/account/leaveRoom';
import sendRoomMessage from 'events/account/sendRoomMessage';
import fetchRoomMessages from 'events/account/fetchRoomMessages';
import deleteRoomMessage from 'events/account/deleteRoomMessage';
import kickMember from 'events/account/kickMember';
import updateProfileStatus from 'events/account/updateProfileStatus';
import fetchConvos from 'events/account/fetchConvos';
import startTyping from 'events/account/startTyping';
import finishTyping from 'events/account/finishTyping';
import addFriend from 'events/account/addFriend';
import removeFriend from 'events/account/removeFriend';
import acceptFriendRequest from 'events/account/acceptFriendRequest';
import rejectFriendRequest from 'events/account/rejectFriendRequest';
import addRoomMember from 'events/account/addRoomMember';
import removeRoomMember from 'events/account/removeRoomMember';
import createDM from 'events/account/createDM';
import sendRoomImage from 'events/account/sendRoomImage';
import fetchHomePosts from 'events/account/fetchHomePosts';
import fetchProfilePosts from 'events/account/fetchProfilePosts';
import closeDM from 'events/account/closeDM';

import { EventExportTemplate } from 'interfaces/all';

const accountTemplate: EventExportTemplate = {
    fetchProfileId,
    fetchProfileData,
    logout,
    updateProfileData,
    createRoom,
    updateRoomData,
    leaveRoom,
    sendRoomMessage,
    fetchRoomMessages,
    deleteRoomMessage,
    kickMember,
    updateProfileStatus,
    fetchConvos,
    startTyping,
    finishTyping,
    addFriend,
    removeFriend,
    acceptFriendRequest,
    rejectFriendRequest,
    addRoomMember,
    removeRoomMember,
    createDM,
    sendRoomImage,
    fetchHomePosts,
    fetchProfilePosts,
    closeDM,
};

export default accountTemplate;
