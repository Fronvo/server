// ******************** //
// Events which are only usable while logged in.
// ******************** //

import fetchProfileId from 'events/account/fetchProfileId';
import fetchProfileData from 'events/account/fetchProfileData';
import logout from 'events/account/logout';
import updateProfileData from 'events/account/updateProfileData';
import createRoom from 'events/account/createRoom';
import joinRoom from 'events/account/joinRoom';
import fetchRoomData from 'events/account/fetchRoomData';
import updateRoomData from 'events/account/updateRoomData';
import leaveRoom from 'events/account/leaveRoom';
import sendRoomMessage from 'events/account/sendRoomMessage';
import fetchRoomMessages from 'events/account/fetchRoomMessages';
import deleteRoomMessage from 'events/account/deleteRoomMessage';
import kickMember from 'events/account/kickMember';
import updateProfileStatus from 'events/account/updateProfileStatus';
import clearProfileStatus from 'events/account/clearProfileStatus';

import { EventExportTemplate } from 'interfaces/all';

const accountTemplate: EventExportTemplate = {
    fetchProfileId,
    fetchProfileData,
    logout,
    updateProfileData,
    createRoom,
    joinRoom,
    fetchRoomData,
    updateRoomData,
    leaveRoom,
    sendRoomMessage,
    fetchRoomMessages,
    deleteRoomMessage,
    kickMember,
    updateProfileStatus,
    clearProfileStatus,
};

export default accountTemplate;
