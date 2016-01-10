CREATE TABLE IF NOT EXISTS users (
    id          INT         	NOT NULL	AUTO_INCREMENT,
    username    VARCHAR(50) 	NOT NULL,
    password    VARCHAR(1024)	NOT NULL,
	salt		VARCHAR(20)		NOT NULL,
    playerId    INT         	NULL,
	deleted		BIT				NOT NULL	DEFAULT 0,

	PRIMARY KEY(id),
    CONSTRAINT UNIQUE UK_USERS_username(username),
    CONSTRAINT FOREIGN KEY FK_USERS_PLAYERS(playerId) REFERENCES players(id)
) ENGINE=InnoDB;

-- Create root user with password "toor"
INSERT IGNORE INTO users(id, username, password, salt)
	VALUES(
		-1,
		'root',
		'c2NyeXB0ABAAAAAIAAAAAc6UvPGmYiCM6LrX4L0JFskLfFOtDR17DmnXD0vNWoKCyJEDsaRZZ1YGtiA+1NfzAfULDyiuaIclDkps1O9aNf7lkqvbt1mrgFOVUrquS8ZI',
		'32c57eed86bf25a1b929'
	);
UPDATE users SET id = 0 WHERE id = -1;
