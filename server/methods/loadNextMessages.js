Meteor.methods({
	loadNextMessages(rid, end, limit = 20) {
		check(rid, String);
		check(limit, Number);

		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'loadNextMessages',
			});
		}

		const fromId = Meteor.userId();

		if (!Meteor.call('canAccessRoom', rid, fromId)) {
			return false;
		}

		const options = {
			sort: {
				ts: 1,
			},
			limit,
		};

		if (!RocketChat.settings.get('Message_ShowEditedStatus')) {
			options.fields = {
				editedAt: 0,
			};
		}

		let records;
		if (end) {
			records = RocketChat.models.Messages.findVisibleByRoomIdAfterTimestamp(rid, end, options).fetch();
		} else {
			records = RocketChat.models.Messages.findVisibleByRoomId(rid, options).fetch();
		}

		return {
			messages: records.map((message) => RocketChat.composeMessageObjectWithUser(message, fromId)),
		};
	},
});
