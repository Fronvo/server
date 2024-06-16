CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE accounts (
	profile_id  VARCHAR(30)		UNIQUE PRIMARY KEY NOT NULL,
	email	    VARCHAR(255)	UNIQUE NOT NULL,
	username 	VARCHAR(30)		NOT NULL,
	bio			VARCHAR(128)	DEFAULT '',
	password    VARCHAR(255)	NOT NULL,
	avatar		VARCHAR(255)	DEFAULT '',
	banner		VARCHAR(255)	DEFAULT '',
	created_at	DATE			NOT NULL DEFAULT NOW(),
	last_status	SMALLINT		NOT NULL DEFAULT 0,
	last_note	VARCHAR(255)	DEFAULT '',
	last_note_d	DATE			DEFAULT NOW()
);

CREATE TABLE posts (
	id          	UUID 			PRIMARY KEY DEFAULT uuid_generate_v4(),
	text			VARCHAR(255)	NOT NULL DEFAULT '',
	attachments		text[]			NOT NULL,
	tags			VARCHAR[]		NOT NULL,
	created_at		DATE			NOT NULL DEFAULT NOW(),
	post_creator	VARCHAR(30)		REFERENCES accounts(profile_id)
)
