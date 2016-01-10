CREATE TABLE IF NOT EXISTS permissions (
	id		INT				NOT NULL	AUTO_INCREMENT,
	`name`	VARCHAR(200)	NOT NULL,

	PRIMARY KEY(id),
	CONSTRAINT UNIQUE UK_PERMISSIONS_name(`name`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_permissions (
	userId			INT	NOT NULL,
	permissionId	INT	NOT NULL,

	PRIMARY KEY(userId, permissionId),
	FOREIGN KEY FK_USER_PERMISSIONS_user(userId) REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY FK_USER_PERMISSIONS_permission(permissionId) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT IGNORE INTO permissions(`name`) VALUES
	('Manage Users'),		-- 1
	('Manage Shows'),		-- 2
	('Manage Players'),		-- 3
	('Manage Locations');	-- 4

-- Give root every available permission
INSERT IGNORE INTO user_permissions(userId, permissionId)
	SELECT 0, p.id
	FROM permissions p;
