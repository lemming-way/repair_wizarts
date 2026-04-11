<?php

ini_set( 'display_errors', 0 );

$out = call_user_func(function() {
  $sql_queries = [
    'getContractorsByProduct' => [
      'sql' => 'SELECT `id_user` FROM `users` WHERE `id_role`=2 AND `id_city`=:cityId AND `active`>0 AND ' .
                'JSON_LENGTH(JSON_EXTRACT(`json`,CONCAT(\'$.services."\',:productId,\'"\')))>0 AND ' .
                '(:isOnline=0 OR `json`->"$.isOnline"=TRUE)',
      'fields' => [
        'numeric' => [ 'id_user' ]
      ]
    ],
    'markUserAsVerified' => [
      'sql' => 'UPDATE `users` SET `id_verification_status`=2 WHERE `id_user`=:u_id'
    ],
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
  ];

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

  $data = json_decode($_REQUEST['s_t_data'], true);
  if (json_last_error() !== JSON_ERROR_NONE) json_exit('400', 'error', 'Bad JSON', NULL);
  if (!isset( $data['action'] )) json_exit('400', 'error', 'No action', NULL);
  if (!isset( $sql_queries[$data['action']] )) json_exit('400', 'error', 'Unknown action', NULL);

  if (!isset($sql_queries[$data['action']]['sql'])) {
    json_exit('400', 'error', 'SQL query not defined for action', NULL);
  }
  $sql = $sql_queries[$data['action']]['sql'];
  if (isset($sql_queries[$data['action']]['fields']['json']) && is_array($sql_queries[$data['action']]['fields']['json'])) {
    $json_fields = $sql_queries[$data['action']]['fields']['json'];
  }
  else {
    $json_fields = [];
  }
  if (isset($sql_queries[$data['action']]['fields']['numeric']) && is_array($sql_queries[$data['action']]['fields']['numeric'])) {
    $numeric_fields = $sql_queries[$data['action']]['fields']['numeric'];
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
