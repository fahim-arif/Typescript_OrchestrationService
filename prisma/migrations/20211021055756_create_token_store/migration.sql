-- CreateTable
CREATE TABLE `token_store` (
    `audience` VARCHAR(191) NOT NULL,
    `token_data` JSON NOT NULL,

    PRIMARY KEY (`audience`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
