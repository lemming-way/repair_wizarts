CREATE TABLE `blog_comment` (
  `id_blog_comment` int NOT NULL AUTO_INCREMENT,
  `id_blog_post` int NOT NULL,
  `parent_id` int DEFAULT NULL,
  `id_user` int NOT NULL,
  `value` text NOT NULL,
  `deleted` tinyint(1) NOT NULL DEFAULT 0,
  `create_datetime` datetime NOT NULL,
  `last_edit_datetime` datetime DEFAULT NULL,
  `last_edit_user` int DEFAULT NULL,
  PRIMARY KEY (`id_blog_comment`),
  KEY `idx_comment_post_parent` (`id_blog_post`,`parent_id`,`id_blog_comment`),
  KEY `idx_comment_parent` (`parent_id`,`id_blog_comment`),
  KEY `idx_comment_user` (`id_user`),
  CONSTRAINT `blog_comment_fk_1` FOREIGN KEY (`id_blog_post`) REFERENCES `blog_post` (`id_blog_post`),
  CONSTRAINT `blog_comment_fk_2` FOREIGN KEY (`parent_id`) REFERENCES `blog_comment` (`id_blog_comment`),
  CONSTRAINT `blog_comment_fk_3` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`),
  CONSTRAINT `blog_comment_fk_4` FOREIGN KEY (`last_edit_user`) REFERENCES `users` (`id_user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
