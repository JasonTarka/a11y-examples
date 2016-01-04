CREATE TABLE IF NOT EXISTS users (
    id          INT         	NOT NULL	AUTO_INCREMENT,
    username    VARCHAR(50) 	NOT NULL,
    password    VARCHAR(1024)	NOT NULL,
    playerId    INT         	NULL,

	PRIMARY KEY(id),
    CONSTRAINT UNIQUE UK_USERS_username(username),
    CONSTRAINT FOREIGN KEY FK_USERS_PLAYERS(playerId) REFERENCES players(id)
) ENGINE=InnoDB;

-- Create root user with password "toor"
INSERT INTO users(id, username, password)
	VALUES( -1, 'root', 'c2NyeXB0ABAAAAAIAAAAAW7B5fp78maa8ZZ3oGbJ422PX1JtsVTTvolzYzkJVwyY40us6ctsechlyC4fvhPCQFOnIaWSEzuexvcW3I900jdfx2iUcOCENK8pXNFtvTHZ' );
UPDATE users SET id = 0 WHERE id = -1;
