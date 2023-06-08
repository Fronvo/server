// ******************** //
// The account-only function tests for the Fronvo server.
// ******************** //

import fetchProfileId from 'test/account/fetchProfileId.test';
import fetchProfileData from 'test/account/fetchProfileData.test';
import updateProfileData from 'test/account/updateProfileData.test';
import updateProfileStatus from 'test/account/updateProfileStatus.test';
import createRoom from 'test/account/createRoom.test';
import fetchRoomData from 'test/account/fetchRoomData.test';
import updateRoomData from 'test/account/updateRoomData.test';
import joinRoom from 'test/account/joinRoom.test';
import sendRoomMessage from 'test/account/sendRoomMessage.test';
import fetchRoomMessages from 'test/account/fetchRoomMessages.test';
import deleteRoomMessage from 'test/account/deleteRoomMessage.test';
import kickMember from 'test/account/kickMember.test';
import leaveRoom from 'test/account/leaveRoom.test';
import logout from 'test/account/logout.test';

export default {
    fetchProfileId,
    fetchProfileData,
    updateProfileData,
    updateProfileStatus,
    createRoom,
    fetchRoomData,
    updateRoomData,
    joinRoom,
    sendRoomMessage,
    fetchRoomMessages,
    deleteRoomMessage,
    kickMember,
    leaveRoom,
    logout,
};
