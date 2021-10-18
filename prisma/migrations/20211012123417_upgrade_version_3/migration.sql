-- RenameIndex
ALTER TABLE `subscribers` RENAME INDEX `subscribers.email_unique` TO `subscribers_email_key`;

-- RenameIndex
ALTER TABLE `subscribers` RENAME INDEX `subscribers.first_name_last_name_index` TO `subscribers_first_name_last_name_idx`;
