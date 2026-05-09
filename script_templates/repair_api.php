<?php

ini_set( 'display_errors', 0 );

$out = call_user_func(function() {
  $current_user_id = '';
  foreach ($_SESSION as $key => $val) {
    if (substr($key, 0, 4) === 'UID:') {
      $current_user_id = $val;
      break;
    }
  }
  $current_user_role = isset($_SESSION['id_role']) ? $_SESSION['id_role'] : 0;
  if ($current_user_role == 2 && isset($_REQUEST['u_a_role']) && $_REQUEST['u_a_role'] == 1) $current_user_role = 1;
  //~ $current_user_status = $_SESSION['id_verification_status'];

  if (!$current_user_id) json_exit('401', 'error', 'Cannot find user ID', NULL);
  if (!isset( $_REQUEST['s_t_data'] )) json_exit('400', 'error', 'No data', NULL);

  // Настройка запросов
  $actions = [
    // ================ Пользователи ================
    // Получение списка мастеров по городу и услуге
    'getContractorsByProduct' => [
      'sql' => 'SELECT `id_user` FROM `users` WHERE `id_role`=2 AND `id_city`=:cityId AND `active`>0 AND ' .
                'JSON_LENGTH(JSON_EXTRACT(`json`,CONCAT(\'$.services."\',:productId,\'"\')))>0 AND ' .
                '(:isOnline=0 OR `json`->"$.isOnline"=TRUE)',
      'fields' => [
        'numeric' => [ 'id_user' ]
      ]
    ],
    // Установить статус верификации водителя без участия администратора
    'markUserAsVerified' => [
      'sql' => 'UPDATE `users` SET `id_verification_status`=2 WHERE `id_user`=:u_id'
    ],
    // ================ Поездки/заказы ================
    // Получить список поездок по заданным параметрам
    'getTripIds' => [
      'sql' => 'SELECT `o`.`id_order` ' .
              'FROM `order` `o` ' .
              'LEFT JOIN (' .
                'SELECT DISTINCT `id_order` ' .
                'FROM `order_driver` ' .
                'WHERE `not_deleted`=1 AND `id_user`=:u_id AND `id_order_driver_status` IN(3,4,5,6)' .
              ') `driving` ON :u_role=2 AND `driving`.`id_order`=`o`.`id_order` ' .
              'LEFT JOIN (' .
                'SELECT DISTINCT `id_order` ' .
                'FROM `order_driver_select` ' .
                'WHERE `id_user`=:u_id AND `cancel`=0' .
              ') `assigned` ON :u_role=2 AND `o`.`id_order_status`=6 AND `assigned`.`id_order`=`o`.`id_order` ' .
              'LEFT JOIN `users` `u` ON :u_role=2 AND `id_user`=:u_id ' .
              'WHERE ' .
                '(' .
                  '((:flags & 1) AND `o`.`only_offer`=0) ' .
                  'OR ((:flags & 2) AND `o`.`only_offer`>0)' .
                ')' .
                'AND (' .
                  '((:flags & 4) AND (`o`.`id_order_status`=1 OR `o`.`id_order_status`=6)) ' .
                  'OR((:flags & 8) AND `o`.`id_order_status`=2) ' .
                  'OR((:flags & 16) AND (`o`.`id_order_status`=3 OR `o`.`id_order_status`=4))' .
                ')' .
                'AND (' .
                  '(:u_role=1 AND `o`.`client`=:u_id) ' .
                  'OR (' .
                    ':u_role=2 ' .
                    'AND (' .
                      '(' .
                        '`id_order_status`=1 ' .
                        'AND `u`.`id_city`=`o`.`city_from` ' .
                        'AND IF(' .
                          'JSON_VALID(`u`.`json`) AND JSON_VALID(`o`.`options`) AND `o`.`options`->>"$.product" REGEXP "^[0-9]+$",' .
                          'JSON_CONTAINS_PATH(`u`.`json`,"one",CONCAT("$.services.\"",`o`.`options`->>"$.product","\"")),' .
                          '0' .
                        ')' .
                      ') ' .
                      'OR (`id_order_status`=6 AND `assigned`.`id_order` IS NOT NULL) ' .
                      'OR `driving`.`id_order` IS NOT NULL' .
                    ')' .
                  ')' .
                ')' .
              'ORDER BY `o`.`create_datetime` DESC',
      'fields' => [
        'numeric' => [ 'id_order' ]
      ]
    ],
    // Получить данные поездок по их ID
    'getTripsByIds' => [
      'sql' => 'SELECT ' .
                '`o`.`id_order` AS `b_id`,' .
                '`o`.`client` AS `u_id`,' .
                '`o`.`city_from` AS `city_start`,' .
                '`o`.`from` AS `b_start_address`,' .
                '`o`.`from_lat` AS `b_start_latitude`,' .
                '`o`.`from_lng` AS `b_start_longitude`,' .
                'NULLIF(`o`.`datetime_start_plan`,0) AS `b_start_datetime`,' .
                'NULLIF(`o`.`comment`,"") AS `b_custom_comment`,' .
                '`o`.`id_order_status` AS `b_state`,' .
                'IF(`o`.`only_offer`>0,1,0) AS `b_only_offer`,' .
                '`o`.`rating` AS `b_rating`,' .
                '`o`.`create_datetime` AS `b_created`,' .
                '`o`.`cancel_reason` AS `b_cancel_reason`,' .
                'NULLIF(`o`.`approve_datetime`,0) AS `b_approved`,' .
                'NULLIF(`o`.`cancel_datetime`,0) AS `b_canceled`,' .
                'NULLIF(`o`.`complete_datetime`,0) AS `b_completed`,' .
                'TIMESTAMPDIFF(' .
                  'SECOND,' .
                  'IF(`o`.`datetime_start_plan`=0,`o`.`create_datetime`,`o`.`datetime_start_plan`),' .
                  '`o`.`max_waiting_datetime`' .
                ') AS `b_max_waiting`,' .
                'NULLIF(`o`.`options`,"") AS `b_options`,' .
                '`o`.`price_estimate` AS `b_price_estimate`,' .
                '`o`.`currency` AS `b_currency`,' .
                '`o`.`id_payment_method` AS `b_payment_way`,' .
                '`o`.`id_payment_card` AS `b_payment_card`,    ' .
                '`drivers`,' .
                'IF(:u_role=2,IFNULL(`drivers_count`,0),NULL) AS `drivers_count`,' .
                '`b_cancel_states`,' .
                'IF(:u_role=2,IF(`ods2`.`id_order` IS NULL,0,1),NULL) AS `b_offer`,' .
                '`b_offers` ' .
              'FROM `order` `o` ' .
              'LEFT JOIN (' .
                'SELECT ' .
                  '`id_order`,' .
                  'JSON_OBJECTAGG(`id_user`,`id_order_cancel`) AS `b_cancel_states` ' .
                'FROM (' .
                  'SELECT ' .
                    '`id_order`,' .
                    '`id_user`,' .
                    'JSON_ARRAYAGG(`id_order_cancel`) AS `id_order_cancel` ' .
                  'FROM `order_cancel_items` ' .
                  'GROUP BY `id_order`,`id_user`' .
                ') `oci_all` ' .
                'GROUP BY `id_order`' .
              ') `oci` ON `oci`.`id_order`=`o`.`id_order` ' .
              'LEFT JOIN (' .
                'SELECT ' .
                  '`id_order`,' .
                  'JSON_ARRAYAGG(' .
                    'JSON_OBJECT(' .
                      '"u_id",`id_user`,' .
                      '"created",`create_datetime`' .
                    ')' .
                  ') AS `b_offers` ' .
                'FROM `order_driver_select` ' .
                'WHERE `cancel`=0 ' .
                'GROUP BY `id_order`' .
              ') `ods` ON :u_role=1 AND `ods`.id_order=`o`.`id_order` ' .
              'LEFT JOIN (' .
                'SELECT DISTINCT `id_order` ' .
                'FROM `order_driver_select` ' .
                'WHERE `id_user`=:u_id AND `cancel`=0' .
              ') `ods2` ON :u_role=2 AND `o`.`id_order_status`=6 AND `ods2`.`id_order`=`o`.`id_order` ' .
              'LEFT JOIN (' .
                'SELECT ' .
                  '`id_order`,' .
                  'JSON_ARRAYAGG(' .
                    'JSON_OBJECT(' .
                      '"u_id",`id_user`,' .
                      '"c_id",`id_car`,' .
                      '"c_state",`id_order_driver_status`,' .
                      '"c_payment_way",`id_payment_method`,' .
                      '"c_payment_card",`id_payment_card`,' .
                      '"c_cancel_reason",`cancel_reason`,' .
                      '"c_rating",`rating`,' .
                      '"c_becomed_candidate",NULLIF(`candidacy_datetime`,0),' .
                      '"c_appointed",NULLIF(`appoint_datetime`,0),' .
                      '"c_canceled",NULLIF(`cancel_datetime`,0),' .
                      '"c_arrived",NULLIF(`arrive_datetime`,0),' .
                      '"c_started",NULLIF(`start_datetime`,0),' .
                      '"c_completed",NULLIF(`complete_datetime`,0),' .
                      '"c_options",CAST(NULLIF(`options`,"") AS JSON)' .
                    ')' .
                  ') AS `drivers`,' .
                  'MAX(IF(:u_role=2 AND `id_user`=:u_id AND `id_order_driver_status` IN(3,4,5,6),1,0)) AS `driving` ' .
                'FROM `order_driver` ' .
                'WHERE `not_deleted`=1 AND (:u_role=1 OR `id_user`=:u_id) ' .
                'GROUP BY `id_order` ' .
              ') `od` ON `od`.`id_order`=`o`.`id_order` ' .
              'LEFT JOIN (' .
                'SELECT ' .
                  '`id_order`,' .
                  'COUNT(1) AS `drivers_count` ' .
                'FROM `order_driver` ' .
                'WHERE `not_deleted`=1 ' .
                'GROUP BY `id_order` ' .
              ') `odc` ON :u_role=2 AND `odc`.`id_order`=`o`.`id_order` ' .
              'LEFT JOIN `users` `u` ON :u_role=2 AND `id_user`=:u_id ' .
              'WHERE `o`.`id_order` IN(:order_ids) ' .
                'AND (' .
                  '(:u_role=1 AND `o`.`client`=:u_id) ' .
                  'OR (' .
                    ':u_role=2 ' .
                    'AND (' .
                      '(' .
                        '`id_order_status`=1 ' .
                        'AND `u`.`id_city`=`o`.`city_from`' .
                        'AND IF(' .
                          'JSON_VALID(`u`.`json`) AND JSON_VALID(`o`.`options`) AND `o`.`options`->>"$.product" REGEXP "^[0-9]+$",' .
                          'JSON_CONTAINS_PATH(`u`.`json`,"one",CONCAT("$.services.\"",`o`.`options`->>"$.product","\"")),' .
                          '0' .
                        ')' .
                      ')' .
                      'OR (`o`.`id_order_status`=6 AND `ods2`.`id_order` IS NOT NULL) ' .
                      'OR `driving`>0' .
                    ')' .
                  ')' .
                ')',
      'fields' => [
        'json' => ['b_options', 'drivers', 'b_offers', 'b_cancel_states'],
        'numeric' => [
          'b_id', 'u_id', 'city_start', 'b_start_latitude', 'b_start_longitude', 'b_state', 'b_only_offer',
          'b_rating', 'b_max_waiting', 'b_price_estimate', 'b_payment_way', 'b_payment_card', 'b_offer'
        ]
      ]
    ],
    // ================ Сообщения/чаты ================
    'getActiveChats' => [
      'sql' => 'SELECT `order`,`client`,`contractor`,`unread_count`,`first_unread`,`last_time` ' .
                'FROM (' .
                  'SELECT ' .
                    '`o`.`id_order` AS `order`,' .
                    '`o`.`client` AS `client`,' .
                    '`o`.`options` AS `o_options`,' .
                    '`d`.`id_user` AS `contractor`,' .
                    '`d`.`options` AS `d_options`,' .
                    'IFNULL(SUM(`m`.`id_message` IS NOT NULL AND `r`.`id_message` IS NULL),0) AS `unread_count`,' .
                    'MIN(IF(`r`.`id_message` IS NULL,`m`.`id_message`,NULL)) AS `first_unread`,' .
                    'GREATEST(MAX(`m`.`create_datetime`),MAX(`m`.`last_edit_datetime`)) AS `last_time` ' .
                  'FROM `order` `o` ' .
                  'JOIN `order_driver` `d` ON `d`.`id_order`=`o`.`id_order` ' .
                  'LEFT JOIN `message` `m` ' .
                    'ON `m`.`recipient_owner_type`=31 ' .
                    'AND `m`.`recipient_owner`=CONCAT(`o`.`id_order`,\':\',`d`.`id_user`) ' .
                    'AND `m`.`active_status`>0 ' .
                  'LEFT JOIN `messages_read` `r` ' .
                    'ON `r`.`id_message`=`m`.`id_message` ' .
                    'AND `r`.`id_user`=:u_id ' .
                  'WHERE `o`.`id_order_status` IN(2,3,4) ' .
                    'AND `d`.`id_order_driver_status` IN(2,3,4,5,6) ' .
                    'AND `d`.`not_deleted`>0 ' .
                    'AND (' .
                      '(:u_role=1 AND `o`.`client`=:u_id) ' .
                      'OR (:u_role=2 AND `d`.`id_user`=:u_id)' .
                    ') ' .
                  'GROUP BY `d`.`id_user`,`o`.`id_order` ' .
                  //~ 'HAVING `unread_count`>0 ' .
                    //~ 'OR (:u_role=1 AND JSON_CONTAINS(`o`.`options`,CAST(`d`.`id_user` AS JSON),\'$.chatOpen\')) ' .
                    //~ 'OR (:u_role=2 AND JSON_CONTAINS(`d`.`options`,\'{"chatOpen":true}\',\'$\'))' .
                ') `inner`',
      'fields' => [
        'numeric' => ['order', 'client', 'contractor', 'unread_count', 'first_unread']
      ]
    ],
    // Получить список активных чатов для пользователя
    'getActiveChatIds' => [
      'sql' => 'SELECT CONCAT(`order`,\':\',`contractor`) AS `id`' .
                'FROM (' .
                  'SELECT ' .
                    '`o`.`id_order` AS `order`,' .
                    '`o`.`options` AS `o_options`,' .
                    '`d`.`id_user` AS `contractor`,' .
                    '`d`.`options` AS `d_options`,' .
                    'EXISTS(' .
                      'SELECT 1 FROM `message` `m` ' .
                      'LEFT JOIN `messages_read` `r` ' .
                        'ON `r`.`id_message`=`m`.`id_message` ' .
                        'AND `r`.`id_user`=:u_id ' .
                      'WHERE `m`.`recipient_owner_type`=31 ' .
                        'AND `m`.`recipient_owner`=CONCAT(`o`.`id_order`,\':\',`d`.`id_user`) ' .
                        'AND `m`.`active_status`>0 ' .
                        'AND `r`.`id_message` IS NULL' .
                    ') AS `has_unread` ' .
                  'FROM `order` `o` ' .
                  'JOIN `order_driver` `d` ON `d`.`id_order`=`o`.`id_order` ' .
                  'WHERE `o`.`id_order_status` IN(2,3,4) ' .
                    'AND `d`.`id_order_driver_status` IN(2,3,4,5,6) ' .
                    'AND `d`.`not_deleted`>0 ' .
                    'AND (' .
                      '(:u_role=1 AND `o`.`client`=:u_id) ' .
                      'OR (:u_role=2 AND `d`.`id_user`=:u_id)' .
                    ') ' .
                  'GROUP BY `d`.`id_user`,`o`.`id_order` ' .
                  //~ 'HAVING `has_unread`>0 ' .
                    //~ 'OR (:u_role=1 AND JSON_CONTAINS(`o`.`options`,CAST(`d`.`id_user` AS JSON),\'$.chatOpen\')) ' .
                    //~ 'OR (:u_role=2 AND JSON_CONTAINS(`d`.`options`,\'{"chatOpen":true}\',\'$\'))' .
                ') `inner`',
    ],
    // Получить данные чатов по `id`
    'getChats' => [
      'sql' => 'SELECT ' .
                  '`o`.`id_order` AS `order`,' .
                  '`o`.`client` AS `client`,' .
                  '`d`.`id_user` AS `contractor`,' .
                  'IFNULL(SUM(`m`.`id_message` IS NOT NULL AND `r`.`id_message` IS NULL),0) AS `unread_count`,' .
                  'MIN(IF(`r`.`id_message` IS NULL,`m`.`id_message`,NULL)) AS `first_unread`,' .
                  'GREATEST(MAX(`m`.`create_datetime`),MAX(`m`.`last_edit_datetime`)) AS `last_time`,' .
                  '(' .
                    '(:u_role=1 AND JSON_CONTAINS(`o`.`options`,CAST(`d`.`id_user` AS JSON),\'$.chatOpen\')) ' .
                    'OR (:u_role=2 AND JSON_CONTAINS(`d`.`options`,\'{"chatOpen":true}\',\'$\'))' .
                  ') AS `is_open` ' .
                'FROM JSON_TABLE(' .
                  'JSON_ARRAY(:ids),\'$[*]\' ' .
                  'COLUMNS(`id` VARCHAR(255) PATH \'$\')' .
                ') AS `ids` ' .
                'JOIN `order` `o` ' .
                  'ON `o`.`id_order`=SUBSTRING_INDEX(`ids`.`id`,\':\',1) ' .
                'JOIN `order_driver` `d` ' .
                  'ON `d`.`id_user`= SUBSTRING_INDEX(`ids`.`id`,\':\',-1) ' .
                  'AND `d`.`id_order`=`o`.`id_order` ' .
                'LEFT JOIN `message` `m` ' .
                  'ON `m`.`recipient_owner_type`=31 ' .
                  'AND `m`.`recipient_owner`=`ids`.`id` ' .
                  'AND `m`.`active_status`>0 ' .
                'LEFT JOIN `messages_read` `r` ' .
                  'ON `r`.`id_message`=`m`.`id_message` ' .
                  'AND `r`.`id_user`=:u_id ' .
                'WHERE `o`.`id_order_status` IN(2,3,4) ' .
                  'AND `d`.`id_order_driver_status` IN(2,3,4,5,6) ' .
                  'AND `d`.`not_deleted`>0 ' .
                  'AND (' .
                    '(:u_role=1 AND `o`.`client`=:u_id) ' .
                    'OR (:u_role=2 AND `d`.`id_user`=:u_id)' .
                  ') ' .
                'GROUP BY `ids`.`id`',
      'fields' => [
        'numeric' => ['order', 'client', 'contractor', 'unread_count', 'first_unread', 'is_open']
      ]
    ],
    // Получить id всех сообщений в чате
    'getMessageIds' => [
      'sql' => 'SELECT NOW() AS `server_time`,' .
                'JSON_ARRAYAGG(`id_message`) AS `messages` ' .
              'FROM `message` ' .
              'WHERE (' .
                  'SUBSTRING_INDEX(:chat_id,\':\',-1)=:u_id ' .
                  'OR EXISTS(SELECT 1 FROM `order` WHERE `id_order`=SUBSTRING_INDEX(:chat_id,\':\',1) AND `client`=:u_id)' .
                ') ' .
                'AND `recipient_owner_type`=31 ' .
                'AND `recipient_owner`=:chat_id ' .
                'AND `id_message_type` IN(1,31,32) ' .
                'AND `active_status`>0 ' .
              'ORDER BY `id_message`',
      'fields' => [
        'json' => ['messages']
      ]
    ],
    // Получить id всех сообщений в чате, обновлённых с заданного момента времени
    'getUpdatedMessageIds' => [
      'sql' => 'SELECT NOW() AS `server_time`,' .
                 'JSON_ARRAYAGG(' .
                   'JSON_OBJECT(' .
                     '\'id\',`id_message`,' .
                     '\'del\',IF(`active_status`=0,1,0)' .
                   ')' .
                 ') `messages` ' .
               'FROM `message` ' .
                'WHERE (' .
                    'SUBSTRING_INDEX(:chat_id,\':\',-1)=:u_id ' .
                    'OR EXISTS(SELECT 1 FROM `order` WHERE `id_order`=SUBSTRING_INDEX(:chat_id,\':\',1) AND `client`=:u_id)' .
                  ') ' .
                  'AND `recipient_owner_type`=31 ' .
                  'AND `recipient_owner`=:chat_id ' .
                  'AND `id_message_type` IN(1,31,32) ' .
                  'AND GREATEST(`create_datetime`,`last_edit_datetime`)>:since ' .
                'ORDER BY `id_message`',
      'fields' => [
        'json' => ['messages']
      ]
    ],
    // Получить сообщения по списку id
    'getMessages' => [
      'sql' => 'SELECT `m`.`id_message`  AS `id`,' .
                'IF(`sender_owner_type`=1,`sender_owner`,NULL) AS `from`,' .
                '`value` AS `text`,' .
                '`last_edit_datetime` AS `modified`,' .
                '`last_edit_user` AS `editor`,' .
                '`create_datetime` AS `created`,' .
                '`create_user` AS `author`,' .
                '`id_message_type` AS `type`,' .
                '`id_message_upper` AS `related`,' .
                'IF(`r`.`id_message` IS NULL,1,0) AS `unread` ' .
              'FROM `message` `m` ' .
              'JOIN `order` `o` ON `o`.`id_order`=SUBSTRING_INDEX(`recipient_owner`,\':\',1) ' .
              'LEFT JOIN `messages_read` `r` ' .
                'ON `r`.`id_message`=`m`.`id_message` ' .
                'AND `r`.`id_user`=:u_id ' .
              'WHERE `m`.`id_message` IN(:ids) ' .
                'AND (' .
                  'SUBSTRING_INDEX(`recipient_owner`,\':\',-1)=:u_id ' .
                  'OR `o`.`client`=:u_id' .
                ') ' .
                'AND `active_status`>0 ' .
                'AND `recipient_owner_type`=31 ' .
                'AND `id_message_type` IN(1,31,32)',
      'fields' => [
        'numeric' => ['id', 'from', 'editor', 'author', 'type', 'related', 'deleted', 'unread']
      ]
    ],
    // Пометить сообщения прочитанными
    'markMessagesAsRead' => [
      'sql' => 'INSERT IGNORE INTO `messages_read` ' .
                'SELECT `m`.`id_message`,' .
                  ':u_id AS `id_user`,' .
                  'NOW() AS `read` ' .
                'FROM `message` `m` ' .
                'JOIN `order` `o` ON `o`.`id_order`=SUBSTRING_INDEX(`recipient_owner`,\':\',1) ' .
                'WHERE `m`.`id_message` IN(:ids) ' .
                  'AND (' .
                    'SUBSTRING_INDEX(`recipient_owner`,\':\',-1)=:u_id ' .
                    'OR `o`.`client`=:u_id' .
                  ')' .
                  'AND `active_status`>0 ' .
                  'AND `recipient_owner_type`=31 ' .
                  'AND `id_message_type` IN(1,31,32)'
    ]
  ];

  $data = json_decode($_REQUEST['s_t_data'], true);
  if (json_last_error() !== JSON_ERROR_NONE) json_exit('400', 'error', 'Bad JSON', NULL);
  if (!isset( $data['action'] )) json_exit('400', 'error', 'No action', NULL);
  if (!isset( $actions[$data['action']] )) json_exit('400', 'error', 'Unknown action', NULL);

  if (!isset($actions[$data['action']]['sql'])) {
    json_exit('400', 'error', 'SQL query not defined for action', NULL);
  }
  $sql = $actions[$data['action']]['sql'];
  if (isset($actions[$data['action']]['fields']['json']) && is_array($actions[$data['action']]['fields']['json'])) {
    $json_fields = $actions[$data['action']]['fields']['json'];
  }
  else {
    $json_fields = [];
  }
  if (isset($actions[$data['action']]['fields']['numeric']) && is_array($actions[$data['action']]['fields']['numeric'])) {
    $numeric_fields = $actions[$data['action']]['fields']['numeric'];
  }
  else {
    $numeric_fields = [];
  }
  unset($data['action']);
  $data['u_id'] = $current_user_id;
  $data['u_role'] = $current_user_role;

  $escape = function($value) {
    if (is_null($value)) {
      return 'NULL';
    }
    elseif (is_bool($value)) {
      return $value ? 1 : 0;
    }
    else {
      $value = real_escape_string($value);
      if (!is_numeric($value) || !is_finite($value)) $value = "'$value'";
      return $value;
    }
  };

  foreach ($data as &$value) {
    if (is_array($value)) {
      if ($value === []) {
        $value = "''";
        continue;
      }
      elseif (array_keys($value) === range(0, count($value) - 1)) {
        $values = [];
        foreach ($value as $item) {
          if (is_array($item)) break;
          $values[] = $escape($item);
        }
        if (count($values) === count($value)) {
          $value = join(',', $values);
          continue;
        }
      }
      $value = $escape(json_encode($value, JSON_UNESCAPED_UNICODE + JSON_UNESCAPED_SLASHES));
    }
    else {
      $value = $escape($value);
    }
  }
  unset($value);
  $sql = preg_replace_callback(
    '/\'(?:[^\'\\\\]+|\\\\.)*\'(*SKIP)(*FAIL)|"(?:[^"\\\\]+|\\\\.)*"(*SKIP)(*FAIL)|`(?:[^`]*)`(*SKIP)(*FAIL)|:([A-Za-z_]+)/',
    function($matches) use($data) {
      if (!isset( $data[$matches[1]] )) {
        json_exit('400', 'error', "Variable unset: $matches[1]", NULL);
      }
      return $data[$matches[1]];
    },
    $sql
  );

  $result = @query($sql);
  if (!$result) {
    $err = error_db();
    if (!$err) $err = 'MySQL error';
    json_exit('500', 'error', $err, NULL);
  }

  $query_type = strtolower(substr($sql, 0, 6));
  if ($query_type === 'select') {
    $out = [];
    while ($row = fetch_assoc($result)) {
      if ($json_fields) {
        foreach ($row as $key => &$value) {
          if (!is_null($value) && in_array($key, $json_fields)) {
            $decoded_json = json_decode($value, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
              json_exit('500', 'error', "Failed to decode JSON field '$key': " . json_last_error_msg(), NULL);
            }
            $value = $decoded_json;
          }
        }
        unset($value);
      }
      if ($numeric_fields) {
        foreach ($row as $key => &$value) {
          if (!is_null($value) && in_array($key, $numeric_fields)) {
            $value = floatval($value);
          }
        }
        unset($value);
      }
      if (count(array_keys($row)) === 1) $out[] = array_values($row)[0];
      else $out[] = $row;
    }
  }
  elseif ($query_type === 'insert') {
    $out = [ 'id' => insert_id() ];
  }
  else {
    $out = null;
  }

  return $out;
});
