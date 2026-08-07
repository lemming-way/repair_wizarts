<?php

ini_set( 'display_errors', 0 );

$out = call_user_func(function() {
  /********************************************************************
                         Вспомогательные функции
  ********************************************************************/

  $die = function($code, $message) {
    json_exit("$code", 'error', $message);
  };

  $base64url_encode = function($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
  };

  // Обработка входных данных и данных авторизации
  $get_context = function() {
    $current_user_id = defined('UID') ? intval($_SESSION[UID]) : 0;
    $current_user_role = isset($_SESSION['id_role']) ? intval($_SESSION['id_role']) : 0;
    $active_role = isset($this->id_role) ? intval($this->id_role) : $current_user_role;
    if ($current_user_role === 2 && $active_role === 1) $current_user_role = 1;
    //~ $current_user_status = $_SESSION['id_verification_status'];

    if (!$current_user_id) throw new Exception('Cannot find user ID', 401);
    if (!isset( $_REQUEST['s_t_data'] )) throw new Exception('No data', 400);

    $data = json_decode($_REQUEST['s_t_data'], true);
    if (json_last_error() !== JSON_ERROR_NONE) throw new Exception('Bad JSON', 400);
    if (!isset( $data['action'] )) throw new Exception('No action', 400);
    $action = $data['action'];
    unset( $data['action'] );

    $files = [];
    if (!empty($_FILES)) {
      foreach ($_FILES as $name => $file) {
        if (is_array($file['error'])) {
          $tmp_arr = [];
          $keys = array_keys($file['error']);
          sort($keys, SORT_NUMERIC);
          foreach ($keys as $i) {
            // Проверяем нет ли лишних индексов или других нарушений в структуре данных
            if (!is_int($file['error'][$i])) throw new Exception('Bad data', 400);
            if ($file['error'][$i] !== UPLOAD_ERR_OK || !is_uploaded_file($file['tmp_name'][$i])) {
              throw new Exception("File upload error ({$file['error'][$i]}).", 400);
            }
            $tmp_arr[] = [
              'name' => $file['name'][$i],
              'type' => $file['type'][$i],
              'size' => $file['size'][$i],
              'tmp_name' => $file['tmp_name'][$i],
              'error' => $file['error'][$i]
            ];
          }
          $files[$name] = $tmp_arr;
        }
        else {
          if ($file['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($file['tmp_name'])) {
            throw new Exception("File upload error ($file[error]).", 400);
          }
          $files[$name] = $file;
        }
      }
    }

    $data['u_id'] = $current_user_id;
    $data['u_role'] = $current_user_role;

    return [
      'u_id' => $current_user_id,
      'u_role' => $current_user_role,
      'action' => $action,
      'data' => $data,
      'files' => $files
    ];
  };

  // Умное экранирование строк с учётом числовых и булевых значений
  $sql_escape = function($value) {
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

  // Выполнение SQL запроса с подстановкой переменных и возвратом полученного результата
  $query = function($sql, $data, $options = []) use($sql_escape) {
    if (!$sql) return null;
    if (isset($options['json_fields']) && is_array($options['json_fields'])) {
      $json_fields = $options['json_fields'];
    }
    else {
      $json_fields = [];
    }
    if (isset($options['numeric_fields']) && is_array($options['numeric_fields'])) {
      $numeric_fields = $options['numeric_fields'];
    }
    else {
      $numeric_fields = [];
    }

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
            $values[] = $sql_escape($item);
          }
          if (count($values) === count($value)) {
            $value = join(',', $values);
            continue;
          }
        }
        $value = $sql_escape(json_encode($value, JSON_UNESCAPED_UNICODE + JSON_UNESCAPED_SLASHES));
      }
      else {
        $value = $sql_escape($value);
      }
    }
    unset($value);
    $sql = preg_replace_callback(
      '/\'(?:[^\'\\\\]+|\\\\.)*\'(*SKIP)(*FAIL)|"(?:[^"\\\\]+|\\\\.)*"(*SKIP)(*FAIL)|`(?:[^`]*)`(*SKIP)(*FAIL)|:([A-Za-z_][A-Za-z0-9_]*)/',
      function($matches) use($data) {
        if (!isset( $data[$matches[1]] )) {
          throw new Exception("Variable unset: $matches[1]", 400);
        }
        return $data[$matches[1]];
      },
      $sql
    );

    $result = @query($sql);
    if (!$result) {
      $err = error_db();
      if (!$err) $err = 'MySQL error';
      throw new Exception($err, 500);
    }

    if ($result === true) {
      $ret = [ 'rows' => affected_rows() ];
      $last_id = insert_id();
      if ($last_id > 0) {
        $ret['id'] = $last_id;
      }
    }
    else {
      $ret = [];
      while ($row = fetch_assoc($result)) {
        if ($json_fields || $numeric_fields) {
          foreach ($row as $key => $value) {
            if (!is_null($value)) {
              if ($json_fields && in_array($key, $json_fields)) {
                $decoded_json = json_decode($value, true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                  throw new Exception("Failed to decode JSON field '$key': " . json_last_error_msg(), 500);
                }
                $row[$key] = $decoded_json;
              }
              elseif ($numeric_fields && in_array($key, $numeric_fields)) {
                $row[$key] = +$value;
              }
            }
          }
        }
        if (count(array_keys($row)) === 1) $ret[] = array_values($row)[0];
        else $ret[] = $row;
      }
    }

    return $ret;
  };

  try {
    // Получаем контекст
    $context = $get_context();
    $data = $context['data'];

    /********************************************************************
                             Выполнение действий
    ********************************************************************/

    switch($context['action']) {
    // ==============================================
    //                  Пользователи
    // ==============================================

    // Получение списка мастеров по городу и услуге
    case 'getContractorsByProduct':
      $sql = 'SELECT `id_user` FROM `users` WHERE `id_role`=2 AND `id_city`=:cityId AND `active`>0 AND ' .
                'JSON_LENGTH(JSON_EXTRACT(`json`,CONCAT(\'$.services."\',:productId,\'"\')))>0 AND ' .
                '(:isOnline=0 OR `json`->\'$.isOnline\'=TRUE)';
      return $query($sql, $data, [ 'numeric_fields' => [ 'id_user' ] ]);

      // Установить статус верификации водителя без участия администратора
    case 'markUserAsVerified':
      $sql = 'UPDATE `users` SET `id_verification_status`=2 WHERE `id_user`=:u_id';
      return $query($sql, $data);

    // ================================================
    //                  Поездки/заказы
    // ================================================

    // Получить список поездок по заданным параметрам / к удалению
    case 'getTripIds':
      $sql = 'SELECT `o`.`id_order` ' .
              ($context['u_role'] === 2 ?
                'FROM (' .
                  'SELECT `o`.`id_order`,`o`.`only_offer`,`o`.`id_order_status`,`o`.`create_datetime` ' .
                  'FROM `order_driver` `d` ' .
                  'JOIN `order` `o` ON `o`.`id_order`=`d`.`id_order` ' .
                  'WHERE `d`.`not_deleted`=1 AND `d`.`id_user`=:u_id AND `d`.`id_order_driver_status` IN(3,4,5,6) ' .
                  'UNION ' .
                  'SELECT `o`.`id_order`,`o`.`only_offer`,`o`.`id_order_status`,`o`.`create_datetime` ' .
                  'FROM `order_driver_select` `ds` ' .
                  'JOIN `order` `o` ON `o`.`id_order`=`ds`.`id_order` ' .
                  'WHERE `ds`.`id_user`=:u_id AND `ds`.`cancel`=0 AND `o`.`id_order_status`=6 ' .
                  'UNION ' .
                  'SELECT `o`.`id_order`,`o`.`only_offer`,`o`.`id_order_status`,`o`.`create_datetime` ' .
                  'FROM `users` `u` ' .
                  'JOIN `order` `o` ON `o`.`city_from`=`u`.`id_city` ' .
                  'WHERE `u`.`id_user`=:u_id '.
                    'AND `o`.`id_order_status`=1 ' .
                    'AND CASE ' .
                      'WHEN JSON_VALID(`u`.`json`) AND JSON_VALID(`o`.`options`) AND `o`.`options`->>\'$.product\' REGEXP \'^[0-9]+$\' ' .
                      'THEN JSON_CONTAINS_PATH(`u`.`json`,\'one\',CONCAT(\'$.services."\',`o`.`options`->>\'$.product\',\'"\')) ' .
                      'ELSE 0 ' .
                    'END' .
                ') `o` '
              :
                'FROM `order` `o` '
              ) .
              'WHERE ' .
                '(' .
                  '((:flags & 1) AND `o`.`only_offer`=0) ' .
                  'OR ((:flags & 2) AND `o`.`only_offer`>0)' .
                ')' .
                'AND (' .
                  '((:flags & 4) AND (`o`.`id_order_status`=1 OR `o`.`id_order_status`=6)) ' .
                  'OR ((:flags & 8) AND `o`.`id_order_status`=2) ' .
                  'OR ((:flags & 16) AND (`o`.`id_order_status`=3 OR `o`.`id_order_status`=4))' .
                ')' .
                ($context['u_role'] === 2 ? '' : 'AND `o`.`client`=:u_id ') .
              'ORDER BY `o`.`create_datetime` DESC';
      return $query($sql, $data, [ 'numeric_fields' => [ 'id_order' ] ]);

    // Получить данные поездок по их ID / к удалению
    case 'getTripsByIds':
      $sql = 'SELECT ' .
                '`o`.`id_order` AS `b_id`,' .
                '`o`.`client` AS `u_id`,' .
                '`o`.`city_from` AS `city_start`,' .
                '`o`.`from` AS `b_start_address`,' .
                '`o`.`from_lat` AS `b_start_latitude`,' .
                '`o`.`from_lng` AS `b_start_longitude`,' .
                'NULLIF(`o`.`datetime_start_plan`,0) AS `b_start_datetime`,' .
                'NULLIF(`o`.`comment`,\'\') AS `b_custom_comment`,' .
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
                'NULLIF(`o`.`options`,\'\') AS `b_options`,' .
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
                      '\'u_id\',`id_user`,' .
                      '\'created\',`create_datetime`' .
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
                      '\'u_id\',`id_user`,' .
                      '\'c_id\',`id_car`,' .
                      '\'c_state\',`id_order_driver_status`,' .
                      '\'c_payment_way\',`id_payment_method`,' .
                      '\'c_payment_card\',`id_payment_card`,' .
                      '\'c_cancel_reason\',`cancel_reason`,' .
                      '\'c_rating\',`rating`,' .
                      '\'c_becomed_candidate\',NULLIF(`candidacy_datetime`,0),' .
                      '\'c_appointed\',NULLIF(`appoint_datetime`,0),' .
                      '\'c_canceled\',NULLIF(`cancel_datetime`,0),' .
                      '\'c_arrived\',NULLIF(`arrive_datetime`,0),' .
                      '\'c_started\',NULLIF(`start_datetime`,0),' .
                      '\'c_completed\',NULLIF(`complete_datetime`,0),' .
                      '\'c_options\',CAST(NULLIF(`options`,\'\') AS JSON)' .
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
                        'AND CASE ' .
                          'WHEN JSON_VALID(`u`.`json`) AND JSON_VALID(`o`.`options`) AND `o`.`options`->>\'$.product\' REGEXP \'^[0-9]+$\' ' .
                          'THEN JSON_CONTAINS_PATH(`u`.`json`,\'one\',CONCAT(\'$.services."\',`o`.`options`->>\'$.product\',\'"\')) ' .
                          'ELSE 0 ' .
                        'END' .
                      ')' .
                      'OR (`o`.`id_order_status`=6 AND `ods2`.`id_order` IS NOT NULL) ' .
                      'OR `driving`>0' .
                    ')' .
                  ')' .
                ')';
      $options = [
        'json_fields' => ['b_options', 'drivers', 'b_offers', 'b_cancel_states'],
        'numeric_fields' => [
          'b_id', 'u_id', 'city_start', 'b_start_latitude', 'b_start_longitude', 'b_state', 'b_only_offer',
          'b_rating', 'b_max_waiting', 'b_price_estimate', 'b_payment_way', 'b_payment_card', 'b_offer'
        ]
      ];
      return $query($sql, $data, $options);

    // Получить список заказов по заданным параметрам
    case 'getOrderIds':
      $sql = 'SELECT `o`.`id_order` ' .
              ($context['u_role'] === 2 ?
                'FROM (' .
                  'SELECT `o`.`id_order`,`o`.`only_offer`,`o`.`id_order_status`,`o`.`create_datetime` ' .
                  'FROM `order_driver` `d` ' .
                  'JOIN `order` `o` ON `o`.`id_order`=`d`.`id_order` ' .
                  'WHERE `d`.`not_deleted`=1 AND `d`.`id_user`=:u_id AND `d`.`id_order_driver_status` IN(3,4,5,6) ' .
                  'UNION ' .
                  'SELECT `o`.`id_order`,`o`.`only_offer`,`o`.`id_order_status`,`o`.`create_datetime` ' .
                  'FROM `order_driver_select` `ds` ' .
                  'JOIN `order` `o` ON `o`.`id_order`=`ds`.`id_order` ' .
                  'WHERE `ds`.`id_user`=:u_id AND `ds`.`cancel`=0 AND `o`.`id_order_status`=6 ' .
                  'UNION ' .
                  'SELECT `o`.`id_order`,`o`.`only_offer`,`o`.`id_order_status`,`o`.`create_datetime` ' .
                  'FROM `users` `u` ' .
                  'JOIN `order` `o` ON `o`.`city_from`=`u`.`id_city` ' .
                  'WHERE `u`.`id_user`=:u_id '.
                    'AND `o`.`id_order_status`=1 ' .
                    'AND CASE ' .
                      'WHEN JSON_VALID(`u`.`json`) AND JSON_VALID(`o`.`options`) AND `o`.`options`->>\'$.product\' REGEXP \'^[0-9]+$\' ' .
                      'THEN JSON_CONTAINS_PATH(`u`.`json`,\'one\',CONCAT(\'$.services."\',`o`.`options`->>\'$.product\',\'"\')) ' .
                      'ELSE 0 ' .
                    'END' .
                ') `o` '
              :
                'FROM `order` `o` '
              ) .
              'WHERE ' .
                '(' .
                  '((:flags & 1) AND `o`.`only_offer`=0) ' .
                  'OR ((:flags & 2) AND `o`.`only_offer`>0)' .
                ')' .
                'AND (' .
                  '((:flags & 4) AND (`o`.`id_order_status`=1 OR `o`.`id_order_status`=6)) ' .
                  'OR ((:flags & 8) AND `o`.`id_order_status`=2) ' .
                  'OR ((:flags & 16) AND (`o`.`id_order_status`=3 OR `o`.`id_order_status`=4))' .
                ')' .
                ($context['u_role'] === 2 ? '' : 'AND `o`.`client`=:u_id ') .
              'ORDER BY `o`.`create_datetime` DESC';
      return $query($sql, $data, [ 'numeric_fields' => [ 'id_order' ] ]);

    // Получить данные заказов по их ID
    case 'getOrdersByIds':
      $sql = 'SELECT ' .
                '`o`.`id_order` AS `id`,' .
                '`o`.`client` AS `client`,' .
                '`c`.`id_user` AS `contractor`,' .
                '`o`.`city_from` AS `city`,' .
                '`o`.`from` AS `address`,' .
                '`o`.`from_lat` AS `latitude`,' .
                '`o`.`from_lng` AS `longitude`,' .
                '`o`.`id_order_status` AS `order_status`,' .
                '`c`.`id_order_driver_status` AS `contractor_status`,' .
                'IF(`o`.`only_offer`>0,1,0) AS `is_direct`,' .
                '`o`.`rating` AS `client_rating`,' .
                '`c`.`rating` AS `contractor_rating`,' .
                '`o`.`create_datetime` AS `created_at`,' .
                'NULLIF(`c`.`appoint_datetime`,0) AS `appointed_at`,' .
                'NULLIF(`c`.`start_datetime`,0) AS `started_at`,' .
                'NULLIF(`c`.`complete_datetime`,0) AS `finished_at`,' .
                'NULLIF(`o`.`cancel_datetime`,0) AS `canceled_at`,' .
                '`o`.`cancel_reason` AS `cancel_reason`,' .
                'NULLIF(`o`.`complete_datetime`,0) AS `completed_at`,' .
                '`o`.`price_estimate` AS `desired_price`,' .
                '`c`.`price_estimate` AS `contractor_price`,' .
                'ROUND(`o`.`sum`,2) AS `agreed_price`,' .
                ($context['u_role'] === 2 ?
                  'IF(`d`.`id_order_driver_status` IN(1,3,4,5,6),JSON_OBJECT(' .
                    '\'id\',`d`.`id_user`,' .
                    '\'price\',IFNULL(`d`.`price_estimate`,0),' .
                    '\'created_at\',IF(`d`.`candidacy_datetime`>0,`d`.`candidacy_datetime`,`d`.`appoint_datetime`),' .
                    '\'comment\',`d`.`options`->>\'$.comment\',' .
                    '\'ready_in\',`d`.`options`->\'$.readyIn\'' .
                  '),NULL) AS `contractor_offer`,' .
                  'IFNULL(`dc`.`count`,0) AS `offers_count`,'
                :
                  '`d`.`drivers` AS `contractor_offers`,'
                ) .
                '`o`.`id_payment_method` AS `payment_way`,' .
                'IF(`ds`.`cancel`=0,`ds`.`id_user`,NULL) AS `invited_contractor`,' .
                '`o`.`options`->>\'$.product\' AS `product`,' .
                '`o`.`options`->\'$.services\' AS `services`,' .
                '`o`.`options`->>\'$.description\' AS `description`,' .
                '`o`.`options`->\'$.images\' AS `images`' .
              'FROM `order` `o` ' .
              ($context['u_role'] === 2 ?
                'LEFT JOIN `order_driver_select` `ds` ' .
                  'ON `o`.`only_offer`>0 AND `ds`.`id_order`=`o`.`id_order` AND `ds`.`id_user`=:u_id '
              :
                'LEFT JOIN LATERAL (' .
                  'SELECT `id_user`,0 AS `cancel` ' .
                  'FROM `order_driver_select` `ds` ' .
                  'WHERE `ds`.`id_order`=`o`.`id_order` AND `ds`.`cancel`=0 ' .
                  'ORDER BY `ds`.`create_datetime` ' .
                  'LIMIT 1' .
                ') `ds` ON `o`.`only_offer`>0 '
              ) .
              ($context['u_role'] === 2 ?
                'JOIN LATERAL (' .
                  'SELECT COUNT(1) AS `count` ' .
                  'FROM `order_driver` `d` ' .
                  'WHERE `d`.`id_order`=`o`.`id_order` AND `d`.`id_order_driver_status` IN(1,3,4,5,6) AND `d`.`not_deleted`=1' .
                ') `dc` ' .
                'LEFT JOIN `order_driver` `d` ' .
                  'ON `d`.`id_order`=`o`.`id_order` ' .
                  'AND `d`.`id_order_driver_status` IN(1,2,3,4,5,6) '.
                  'AND `d`.`not_deleted`=1 '.
                  'AND `d`.`id_user`=:u_id '
              :
                'LEFT JOIN LATERAL (' .
                  'SELECT ' .
                    'JSON_ARRAYAGG(' .
                      'JSON_OBJECT(' .
                        '\'id\',`d`.`id_user`,' .
                        '\'price\',IFNULL(`d`.`price_estimate`,0),' .
                        '\'created_at\',IF(`d`.`candidacy_datetime`>0,`d`.`candidacy_datetime`,`d`.`appoint_datetime`),' .
                        '\'comment\',`d`.`options`->>\'$.comment\',' .
                        '\'ready_in\',`d`.`options`->\'$.readyIn\'' .
                      ')' .
                    ') AS `drivers` ' .
                  'FROM `order_driver` `d` ' .
                  'WHERE `d`.`id_order`=`o`.`id_order` AND `d`.`id_order_driver_status` IN(1,3,4,5,6) AND `d`.`not_deleted`=1 ' .
                ') `d` ON TRUE '
              ) .
              'LEFT JOIN `order_driver` `c` ' .
                'ON `o`.`id_order_status` IN(2,3,4) ' .
                'AND `c`.`id_order`=`o`.`id_order` ' .
                'AND `c`.`not_deleted`=1 ' .
                'AND `c`.`id_order_driver_status` IN(3,4,5,6) ' .
              ($context['u_role'] === 2 ? 'LEFT JOIN `users` `u` ON `u`.`id_user`=:u_id ' : '') .
              'WHERE `o`.`id_order` IN(:order_ids) ' .
                ($context['u_role'] === 2 ?
                  'AND (' .
                    '(' .
                      '`o`.`id_order_status`=1 ' .
                      'AND `u`.`id_city`=`o`.`city_from` ' .
                      'AND CASE ' .
                        'WHEN JSON_VALID(`u`.`json`) AND JSON_VALID(`o`.`options`) AND `o`.`options`->>\'$.product\' REGEXP \'^[0-9]+$\' ' .
                        'THEN JSON_CONTAINS_PATH(`u`.`json`,\'one\',CONCAT(\'$.services."\',`o`.`options`->>\'$.product\',\'"\')) ' .
                        'ELSE 0 ' .
                      'END' .
                    ')' .
                    'OR (`o`.`id_order_status`=6 AND `ds`.`id_order` IS NOT NULL) ' .
                    'OR `d`.`id_order` IS NOT NULL' .
                  ')'
                :
                  'AND `o`.`client`=:u_id'
                );
      $options = [
        'json_fields' => ['contractor_offers', 'contractor_offer', 'services', 'images'],
        'numeric_fields' => [
          'id', 'client', 'contractor', 'city', 'latitude', 'longitude', 'order_status', 'contractor_status',
          'is_direct', 'client_rating', 'contractor_rating', 'desired_price', 'contractor_price', 'agreed_price',
          'offers_count', 'payment_way', 'invited_contractor', 'product'
        ]
      ];
      return $query($sql, $data, $options);

    // Создать новый заказ
    case 'createOrder':
      if ($context['u_id'] <= 0) $die(403, 'Unauthorized');
      if ($context['u_role'] !== 1) $die(403, 'Wrong user role');
      // очистка исходных данных
      $var_names = [ 'cityId', 'address', 'productId', 'description', 'price' ];
      if (isset($context['data']['contractorId'])) {
        $var_names[] = 'services';
      }
      else {
        $var_names[] = 'price';
      }
      foreach ($var_names as $name) {
        if (!isset($context['data'][$name])) $die(400, "Variable $name not set");
      }
      $city_id = intval($context['data']['cityId']);
      $address = trim(strval($context['data']['address']));
      $product_id = intval($context['data']['productId']);
      $price = round(floatval($context['data']['price']), 2);
      if (isset($context['data']['contractorId'])) {
        $is_direct = true;
        $contractor_id = intval($context['data']['contractorId']);
        if ($contractor_id <= 0) $die(400, 'Bad contractor ID');
        if (!is_array($context['data']['services'])) $die(400, 'Bad services data');
        $result = $query(
          'SELECT `json`->>\'$.services\' `services` FROM `users` WHERE `id_user`=:user AND `id_city`=:city AND `deleted`=0',
          [ 'user' => $contractor_id, 'city' => $city_id ],
          [ 'json_fields' => ['services'] ]
        );
        if (empty($result)) $die(400, 'Contractor not found');
        if (!isset($result[0]) || !is_array($result[0])) $die(400, 'Bad contractor');
        $products = $result[0];
        if (!isset($products[$product_id])) $die(400, 'Contractor does not provide this service');
        $contractor_services = $products[$product_id];
        $service_names = [];
        foreach ($context['data']['services'] as $service) {
          $srv_name = trim(strval($service));
          if (!$srv_name) $die(400, 'Bad services data');
          foreach ($contractor_services as $service_data) {
            if (!empty($service_data['service']) && $service_data['service'] === $srv_name) {
              $service_names[] = $srv_name;
              continue 2;
            }
          }
          $die(400, 'Contractor does not provide this service');
        }
      }
      else {
        $is_direct = false;
      }
      if (!$address || $product_id <= 0 || $price <= 0) $die(400, 'Wrong data');
      $description = trim(strval($context['data']['description']));
      $order_data = [
        'client' => $context['u_id'],
        'city' => $city_id,
        'address' => $address,
        'productId' => $product_id,
        'description' => $description,
        'price' => $price
      ];

      // добавление изображений
      if (!empty($context['files']['attachments'])) {
        $order_data['images'] = [];
        $attachments = $context['files']['attachments'];
        if (count($attachments) > 10) $attachments = array_slice($attachments, 0, 10);
        foreach ($attachments as $index => $file) {
          $ext = substr(pathinfo($file['name'],PATHINFO_EXTENSION),0,63);
          //~ $filename_upload = $base64url_encode(random_bytes(9)) . ($ext ? ".$ext" : '');
          $filename_upload = $base64url_encode(join('', array_map(function() { return chr(rand(0, 255)); }, range(0, 8)))) . ($ext ? ".$ext" : '');

          // Записать данные файла в таблицу
          // Сначала записываем атомарно, без транзакции. Позже бесхозные файлы можно будет удалить.
          $upload_data = [
            'name' => $file['name'],
            'name_upload' => $filename_upload,
            'type' => $file['type'],
            'size' => $file['size']
          ];
          $result = $query(
            'INSERT INTO `dropbox_link`(`json`) VALUES(' .
              'JSON_OBJECT(' .
                '\'name\',:name,' .
                '\'name_upload\',:name_upload,' .
                '\'type\',:type,' .
                '\'size\',:size,' .
                '\'created\',NOW(0)' .
              ')' .
            ')',
            $upload_data
          );
          if (empty($result['id'])) $die(500, 'Database insert error.');
          $upload_id = $result['id'];

          // загрузить файл на dropbox
          $response = upload_to_dropbox(file_get_contents($file['tmp_name']), $filename_upload, $upload_id);
          if (!empty($response['error'])) $die(500, $response['error']);
          $order_data['images'][] = $upload_id;
          $attachments[$index]['id'] = $upload_id;
          $attachments[$index]['dropbox_response'] = $response['data'];
        }
      }
      else {
        $attachments = [];
      }

      // Только когда все файлы успешно загружены, открываем транзакцию
      $query('START TRANSACTION', []);

      $result = $query(
        'SELECT `name`,`family`,`middle` FROM `users` WHERE `id_user`=:user AND `deleted`=0 FOR SHARE',
        [ 'user' => $context['u_id'] ]
      );
      if (empty($result)) $die(400, 'User not found');
      $username = join(' ', array_filter(array_map('trim', [ $result[0]['name'], $result[0]['middle'], $result[0]['family'] ]), 'strlen'));

      if ($is_direct) {
        // Повторная проверка после начала транзакции - теоретически что-нибудь могло измениться
        $result = $query(
          'SELECT `json`->>\'$.services\' `services` FROM `users` WHERE `id_user`=:user AND `id_city`=:city AND `deleted`=0 FOR SHARE',
          [ 'user' => $contractor_id, 'city' => $city_id ],
          [ 'json_fields' => ['services'] ]
        );
        if (empty($result)) $die(400, 'Contractor not found');
        if (!isset($result[0]) || !is_array($result[0])) $die(400, 'Bad contractor');
        $products = $result[0];
        if (!isset($products[$product_id])) $die(400, 'Contractor does not provide this service');
        $contractor_services = $products[$product_id];
        $services = [];
        $actual_price = 0;
        foreach ($service_names as $srv_name) {
          foreach ($contractor_services as $service_data) {
            if (!empty($service_data['service']) && $service_data['service'] === $srv_name) {
              $srv_price = isset($service_data['price']) ? floatval($service_data['price']) : 0;
              $services[] = [
                'service' => $srv_name,
                'price' => $srv_price
              ];
              $actual_price = round($actual_price + $srv_price, 2);
              continue 2;
            }
          }
          $die(400, 'Contractor does not provide this service');
        }
        if ($price !== $actual_price) $die(400, 'Price changed');
        $order_data['services'] = $services;
      }

      $result = $query('SELECT 1 FROM `city` WHERE `id_city`=:city FOR SHARE', [ 'city' => $city_id ]);
      if (!$result) $die(400, 'City not found');

      if ($attachments) {
        foreach ($attachments as $file) {
          $result = $query(
            'UPDATE `dropbox_link` ' .
            'SET `private`=0,`json`=JSON_SET(' .
              '`json`,' .
              '\'$.response\',CAST(:response AS JSON),' .
              '\'$.orderId\',:orderId' .
            ') WHERE `id_dropbox_link`=:fileId',
            [
              'fileId' => $file['id'],
              'orderId' => $order_id,
              'response' => $file['dropbox_response']
            ]
          );
          if (empty($result['rows'])) $die(500, 'Database error.');
        }

        $result = $query('INSERT INTO `users_dropbox_link`(`id_user`,`id_dropbox_link`) VALUES' .
          join(',', array_map(function($file) use($context) { return "($context[u_id],$file[id])"; }, $attachments)),
          []
        );
        if (!$result) $die(500, 'Database insert error.');
      }

      $result = $query(
        'INSERT INTO `order`('.
          '`client`,`from`,`to`,`datetime_start_plan`,`comment`,`flight_number`,`terminal`,`passenger_count`,`luggage_count`,' .
          '`placard`,`id_payment_method`,`id_order_status`,`max_rating`,`last_edit_datetime`,`create_datetime`,`create_user`,' .
          '`confirm_limit_datetime`,`confirm_datetime`,`pay_datetime`,`approve_datetime`,`cancel_datetime`,' .
          '`complete_datetime`,`estimated_waiting_datetime`,`max_waiting_datetime`,`code`,`process_datetime`,' .
          '`pending_datetime`,`log`,`options`,`contact`,`create_ip`,`offer_datetime`,`price_estimate`,`only_offer`,`city_from`' .
        ') VALUES(' .
          ':client,' .  // client
          ':address,' .   // from
          '\'\',0,\'\',\'\',\'\',1,0,\'\',' .   // to, datetime_start_plan, comment, flight_number, terminal, passenger_count, luggage_count, placard
          '1,' .   // id_payment_method
          ($is_direct ? '6,' : '1,') .   // id_order_status
          '5,0,' .   // max_rating, last_edit_datetime
          'NOW(0),:client,' .   // create_datetime, create_user
          '0,0,0,0,0,' .   // confirm_limit_datetime, confirm_datetime, pay_datetime, approve_datetime, cancel_datetime
          '0,0,' .   // complete_datetime, estimated_waiting_datetime
          'NOW(0)+INTERVAL 14 DAY,' .   //  max_waiting_datetime
          '\'\',' .   // code
          ($is_direct ? '0,' : 'NOW(0),') .   // process_datetime
          '0,\'\',' . // pending_datetime, log
          'JSON_OBJECT(' .   // options
            '\'product\',:productId,' .
            '\'description\',:description' .
            ($is_direct ? ',\'services\',CAST(:services AS JSON)' : '') .
            ($attachments ? ',\'images\',JSON_ARRAY(:images)' : '') .
          '),' .
          '\'\',0,' .   // contact, create_ip
          ($is_direct ? 'NOW(0),' : '0,') .   // offer_datetime
          ':price,' .   // price_estimate
          ($is_direct ? '1,' : '0,') .   // only_offer
          ':city' .    // city_from
        ')',
        $order_data
      );
      if (empty($result['id'])) $die(500, 'Database insert error.');
      $order_id = $result['id'];

      if ($is_direct) {
        $result = $query(
          'INSERT INTO `order_driver_select`' .
          '(`id_order`,`id_user`,`create_datetime`,`order_edit_datetime`,`order_select_type`,`cancel_datetime`) ' .
          'VALUES(:order,:user,NOW(0),0,\'Processing\',0)',
          [ 'order' => $order_id, 'user' => $contractor_id ]
        );
        // В таблице order_driver_select нет AUTO_INCREMENT ключа
        if (empty($result['rows'])) $die(500, 'Database insert error.');

        // Создаём системное сообщение для мастера
        $result = $query(
          'INSERT INTO `message`' .
          '(`sender_owner`,`sender_owner_type`,`recipient_owner`,`recipient_owner_type`,`name`,`value`,' .
          '`last_edit_datetime`,`create_datetime`,`id_message_type`) ' .
          'VALUES(4,2,CONCAT(:order,\':\',:contractor),31,\'\',:value,0,NOW(0),31)',
          [
            'order' => $order_id,
            'contractor' => $contractor_id,
            'value' => [ 'text' => "Пользователь $username предложил Вам заказ.", 'eventType' => 'DIRECT_ORDER' ]
          ]
        );
        if (empty($result['id'])) $die(500, 'Database insert error.');
      }

      $query('COMMIT', []);

      return [ 'id' => $order_id ];

    // Изменить заказ
    case 'updateOrder':
      if ($context['u_id'] <= 0) $die(403, 'Unauthorized');
      if ($context['u_role'] !== 1) $die(403, 'Wrong user role');
      // очистка исходных данных
      $order_id = isset($context['data']['id']) ? intval($context['data']['id']) : 0;
      if ($order_id <= 0) $die(400, 'Order ID not set');
      $result = $query(
        'SELECT 1 FROM `order` WHERE `id_order`=:order && `client`=:client && `id_order_status` IN(1,6)',
        [ 'order' => $order_id, 'client' => $context['u_id'] ]
      );
      if (!$result) $die(400, 'Order not found');

      $address = isset($context['data']['address']) ? trim(strval($context['data']['address'])) : '';
      $description = isset($context['data']['description']) ? trim(strval($context['data']['description'])) : null;
      $price = isset($context['data']['price']) ? round(floatval($context['data']['price']), 2) : 0;

      // добавление изображений
      $attachments = [];
      if ((isset($context['data']['attachments']) && is_array($context['data']['attachments'])) || !empty($context['files']['attachments'])) {
        $has_attachments = true;
        $old_attachments = isset($context['data']['attachments']) && is_array($context['data']['attachments']) ? $context['data']['attachments'] : [];
        foreach ($old_attachments as $index => $file_id) {
          if (!is_int($index) || $index < 0 || $index > 9 || !is_int($file_id)) $die(400, 'Invalid attachments data');
        }

        if (!empty($context['files']['attachments'])) {
          $attachments = $context['files']['attachments'];
          if (count($attachments) + count($old_attachments) > 10) $die(400, 'Too many attachments');
          foreach ($attachments as $index => $file) {
            $ext = substr(pathinfo($file['name'],PATHINFO_EXTENSION),0,63);
            //~ $filename_upload = $base64url_encode(random_bytes(9)) . ($ext ? ".$ext" : '');
            $filename_upload = $base64url_encode(join('', array_map(function() { return chr(rand(0, 255)); }, range(0, 8)))) . ($ext ? ".$ext" : '');

            // Записать данные файла в таблицу
            // Сначала записываем атомарно, без транзакции. Позже бесхозные файлы можно будет удалить.
            $upload_data = [
              'name' => $file['name'],
              'name_upload' => $filename_upload,
              'type' => $file['type'],
              'size' => $file['size']
            ];
            $result = $query(
              'INSERT INTO `dropbox_link`(`json`) VALUES(' .
                'JSON_OBJECT(' .
                  '\'name\',:name,' .
                  '\'name_upload\',:name_upload,' .
                  '\'type\',:type,' .
                  '\'size\',:size,' .
                  '\'created\',NOW(0)' .
                ')' .
              ')',
              $upload_data
            );
            if (empty($result['id'])) $die(500, 'Database insert error.');
            $upload_id = $result['id'];

            // загрузить файл на dropbox
            $response = upload_to_dropbox(file_get_contents($file['tmp_name']), $filename_upload, $upload_id);
            if (!empty($response['error'])) $die(500, $response['error']);
            $attachments[$index]['id'] = $upload_id;
            $attachments[$index]['dropbox_response'] = $response['data'];
          }
        }
      }
      else {
        $has_attachments = false;
      }

      // Только когда все файлы успешно загружены, открываем транзакцию
      $query('START TRANSACTION', []);
      $result = $query(
        'SELECT `from`,`options`->>\'$.description\' `description`,`options`->>\'$.images\' `attachments`,' .
          '`price_estimate`,`only_offer` ' .
        'FROM `order` WHERE `id_order`=:order && `client`=:client && `id_order_status` IN(1,6) FOR UPDATE',
        [ 'order' => $order_id, 'client' => $context['u_id'] ],
        [ 'json_fields' => ['attachments'], 'numeric_fields' => ['price_estimate', 'only_offer'] ]
      );
      if (!$result) $die(400, 'Order not found');
      $order_data = $result[0];
      $saved_attachments = isset($order_data['attachments']) && is_array($order_data['attachments']) ? $order_data['attachments'] : [];

      if ($has_attachments) {
        if ($old_attachments) {
          $result = $query(
            'SELECT COUNT(*) `c` FROM `dropbox_link` `l` ' .
            'JOIN `users_dropbox_link` `u` ON `u`.`id_dropbox_link`=`l`.`id_dropbox_link` ' .
            'WHERE `l`.`id_dropbox_link` IN(:files) AND `l`.`deleted`=0 AND `l`.`json`->>\'$.orderId\'=:order ' .
              'AND `u`.`id_user`=:user AND `u`.`owner`=1 ' .
            'FOR SHARE',
            [ 'files' => array_values($old_attachments),'user' => $context['u_id'], 'order' => $order_id ],
            [ 'numeric_fields' => ['c'] ]
          );
          if ($result[0] !== count($old_attachments)) $die(500, 'Bad attachments data.');
        }
        $deleted_attachments = array_diff($saved_attachments, $old_attachments);
        if ($deleted_attachments) {
          // Не удаляем файлы из Dropbox - это сделает сборщик мусора
          $result = $query(
            'UPDATE `dropbox_link` `l` ' .
            'JOIN `users_dropbox_link` `u` ON `u`.`id_dropbox_link`=`l`.`id_dropbox_link` ' .
            'SET `l`.`json`=JSON_REMOVE(`l`.`json`,\'$.orderId\'),`private`=1 ' .
            'WHERE `l`.`id_dropbox_link` IN(:files) AND `l`.`deleted`=0 AND `l`.`json`->>\'$.orderId\'=:order ' .
              'AND `u`.`id_user`=:user AND `u`.`owner`=1 ',
            [ 'files' => $deleted_attachments,'user' => $context['u_id'], 'order' => $order_id ]
          );
          if ($result['rows'] !== count($deleted_attachments)) $die(500, 'Database error.');
        }
        if ($attachments) {
          foreach ($attachments as $file) {
            $result = $query(
              'UPDATE `dropbox_link` ' .
              'SET `private`=0,`json`=JSON_SET(' .
                '`json`,' .
                '\'$.response\',CAST(:response AS JSON),' .
                '\'$.orderId\',:orderId' .
              ') WHERE `id_dropbox_link`=:fileId',
              [
                'fileId' => $file['id'],
                'orderId' => $order_id,
                'response' => $file['dropbox_response']
              ]
            );
            if (empty($result['rows'])) $die(500, 'Database error.');
          }

          $result = $query('INSERT INTO `users_dropbox_link`(`id_user`,`id_dropbox_link`) VALUES' .
            join(',', array_map(function($file) use($context) { return "($context[u_id],$file[id])"; }, $attachments)),
            []
          );
          if (!$result) $die(500, 'Database insert error.');
        }

        $new_attachments = [];
        for ($i = 0; $i <= 9; $i++) {
          if (isset($old_attachments[$i])) $new_attachments[] = $old_attachments[$i];
          elseif ($attachments) $new_attachments[] = array_shift($attachments)['id'];
        }
      }

      $updates = [];
      if ($address && $address !== $order_data['from']) $updates[] = '`from`=:address';
      if ($price > 0 && $price !== $order_data['price_estimate'] && $order_data['only_offer'] === 0) {
        $updates[] = '`price_estimate`=:price';
      }
      if (
        (isset($description) && $description !== $order_data['description']) ||
        ($has_attachments && $new_attachments !== $order_data['attachments'])
      ) {
        $updates[] = '`options`=JSON_SET(`options`' .
          (isset($description) && $description !== $order_data['description'] ? ',\'$.description\',:description' : '') .
          ($has_attachments && $new_attachments !== $order_data['attachments'] ? ',\'$.images\',JSON_ARRAY(:attachments)' : '') .
        ')';
      }
      if ($updates) {
        $result = $query(
          'UPDATE `order` SET ' . join(',', $updates) . ' WHERE `id_order`=:order',
          [ 'order' => $order_id, 'address' => $address, 'price' => $price, 'description' => $description, 'attachments' => $new_attachments ]
        );
        if (!$result['rows']) $die(500, 'Database error.');
      }
      else {
        $result = [ 'rows' => 0 ];
      }

      $query('COMMIT', []);
      return $result;

    // Клиент отменяет заказ
    case 'cancelOrderByClient':

    // Мастер отменяет заказ
    case 'cancelOrderByContractor':

    // Принять прямой заказ от клиента
    case 'acceptDirectOrder':

    // Создать предложение мастера
    case 'createOffer':

    // Отозвать предложение мастера
    case 'revokeOffer':

    // Принять предложение мастера
    case 'acceptOffer':

    // Начать работу над заказом
    case 'startOrderWork':

    // Завершить работу над заказом
    case 'completeOrderWork':

    // Подтвердить завершение заказа
    case 'finishOrder':
      break;

    // ================================================
    //                  Сообщения/чаты
    // ================================================

    // Получить список активных чатов для пользователя
    case 'getActiveChatIds':
      $sql = 'SELECT CONCAT(`order`,\':\',`contractor`) AS `id`' .
                'FROM (' .
                  'SELECT ' .
                    '`o`.`id_order` AS `order`,' .
                    '`o`.`options` AS `o_options`,' .
                    'IFNULL(`d`.`id_user`,`ds`.`id_user`) AS `contractor`,' .
                    '`d`.`options` AS `d_options`,' .
                    '`ds`.`order_select_type`,' .
                    'EXISTS(' .
                      'SELECT 1 FROM `message` `m` ' .
                      'LEFT JOIN `messages_read` `r` ' .
                        'ON `r`.`id_message`=`m`.`id_message` ' .
                        'AND `r`.`id_user`=:u_id ' .
                      'WHERE `m`.`recipient_owner_type`=31 ' .
                        'AND `m`.`recipient_owner`=CONCAT(`o`.`id_order`,\':\',IFNULL(`d`.`id_user`,`ds`.`id_user`)) ' .
                        'AND `m`.`active_status`>0 ' .
                        'AND (`m`.`sender_owner`<>:u_id OR `m`.`sender_owner_type`<>1) ' .
                        'AND `r`.`id_message` IS NULL' .
                    ') AS `has_unread` ' .
                  ($context['u_role'] === 2 ?
                    'FROM (' .
                     'SELECT `id_order`,`id_user` FROM `order_driver` `d` ' .
                     'WHERE `d`.`id_user`=:u_id AND `id_order_driver_status` IN(1,2,3,4,5,6) AND `not_deleted`>0 ' .
                     'UNION ' .
                     'SELECT `id_order`,`id_user` FROM `order_driver_select` `ds` ' .
                     'WHERE `ds`.`id_user`=:u_id AND `cancel`=0' .
                    ') `uids` ' .
                    'JOIN `order` `o` ON `o`.`id_order`=`uids`.`id_order` '
                  :
                    'FROM `order` `o` ' .
                    'JOIN LATERAL (' .
                     'SELECT `id_order`,`id_user` FROM `order_driver` `d` ' .
                     'WHERE `d`.`id_order`=`o`.`id_order` AND `id_order_driver_status` IN(1,2,3,4,5,6) AND `not_deleted`>0 ' .
                     'UNION ' .
                     'SELECT `id_order`,`id_user` FROM `order_driver_select` `ds` ' .
                     'WHERE `ds`.`id_order`=`o`.`id_order` AND `cancel`=0' .
                    ') `uids` '
                  ) .
                  'LEFT JOIN `order_driver` `d` '.
                    'ON `d`.`id_order`=`o`.`id_order` ' .
                    'AND `d`.`id_user`=`uids`.`id_user` ' .
                    'AND `d`.`id_order_driver_status` IN(1,2,3,4,5,6) ' .
                    'AND `d`.`not_deleted`>0 ' .
                  'LEFT JOIN `order_driver_select` `ds` ' .
                    'ON `ds`.`id_order`=`o`.`id_order` ' .
                    'AND `ds`.`id_user`=`uids`.`id_user` ' .
                    'AND `cancel`=0 ' .
                  'WHERE `o`.`id_order_status` IN(1,2,3,4,6) ' .
                    ($context['u_role'] === 2 ? '' : 'AND `o`.`client`=:u_id ') .
                  'GROUP BY `contractor`,`o`.`id_order` ' .
                  'HAVING `has_unread`>0 ' .
                    'OR ' .
                    ($context['u_role'] === 2 ?
                      'JSON_CONTAINS(`d`.`options`,\'{"chatOpen":true}\',\'$\') ' .
                      'OR `ds`.`order_select_type`=\'Active\''
                    :
                      'JSON_CONTAINS(`o`.`options`,CAST(`contractor` AS JSON),\'$.chatOpen\')'
                    ) .
                ') `inner`';
      return $query($sql, $data);

    // Получить данные чатов по `id`
    case 'getChats':
      $sql = 'SELECT ' .
                  '`o`.`id_order` AS `order`,' .
                  '`o`.`client` AS `client`,' .
                  'IFNULL(`d`.`id_user`,`ds`.`id_user`) AS `contractor`,' .
                  'IFNULL(SUM(' .
                    '`m`.`id_message` IS NOT NULL ' .
                    'AND (`m`.`sender_owner`<>:u_id OR `m`.`sender_owner_type`<>1) ' .
                    'AND `r`.`id_message` IS NULL' .
                  '),0) AS `unread_count`,' .
                  'MIN(IF(' .
                    '`m`.`id_message` IS NOT NULL ' .
                    'AND (`m`.`sender_owner`<>:u_id OR `m`.`sender_owner_type`<>1) ' .
                    'AND `r`.`id_message` IS NULL,' .
                    '`m`.`id_message`,' .
                    'NULL' .
                  ')) AS `first_unread`,' .
                  'GREATEST(MAX(`m`.`create_datetime`),MAX(`m`.`last_edit_datetime`)) AS `last_time`,' .
                  '(' .
                    '(:u_role=1 AND JSON_CONTAINS(`o`.`options`,CAST(IFNULL(`d`.`id_user`,`ds`.`id_user`) AS JSON),\'$.chatOpen\')) ' .
                    'OR (:u_role=2 AND (' .
                      'JSON_CONTAINS(`d`.`options`,\'{"chatOpen":true}\',\'$\') ' .
                      'OR `ds`.`order_select_type`=\'Active\'' .
                    '))' .
                  ') AS `is_open` ' .
                'FROM JSON_TABLE(' .
                  'JSON_ARRAY(:ids),\'$[*]\' ' .
                  'COLUMNS(`id` VARCHAR(255) PATH \'$\')' .
                ') AS `ids` ' .
                'JOIN `order` `o` ' .
                  'ON `o`.`id_order`=SUBSTRING_INDEX(`ids`.`id`,\':\',1) ' .
                'LEFT JOIN `order_driver` `d` ' .
                  'ON `d`.`id_user`=SUBSTRING_INDEX(`ids`.`id`,\':\',-1) ' .
                  'AND `d`.`id_order`=`o`.`id_order` ' .
                  'AND `d`.`id_order_driver_status` IN(1,2,3,4,5,6) ' .
                  'AND `d`.`not_deleted`>0 ' .
                'LEFT JOIN `order_driver_select` `ds` ' .
                  'ON `ds`.`id_user`=SUBSTRING_INDEX(`ids`.`id`,\':\',-1) ' .
                  'AND `ds`.`id_order`=`o`.`id_order` ' .
                  'AND `ds`.`cancel`=0 ' .
                'LEFT JOIN `message` `m` ' .
                  'ON `m`.`recipient_owner_type`=31 ' .
                  'AND `m`.`recipient_owner`=`ids`.`id` ' .
                  'AND `m`.`active_status`>0 ' .
                'LEFT JOIN `messages_read` `r` ' .
                  'ON `r`.`id_message`=`m`.`id_message` ' .
                  'AND `r`.`id_user`=:u_id ' .
                'WHERE `o`.`id_order_status` IN(1,2,3,4,6) ' .
                  'AND (`d`.`id_user` IS NOT NULL OR `ds`.`id_user` IS NOT NULL) ' .
                  'AND (' .
                    '(:u_role=1 AND `o`.`client`=:u_id) ' .
                    'OR (:u_role=2 AND (`d`.`id_user`=:u_id OR `ds`.`id_user`=:u_id))' .
                  ') ' .
                'GROUP BY `ids`.`id`';
      $numeric_fields = ['order', 'client', 'contractor', 'unread_count', 'first_unread', 'is_open'];
      return $query($sql, $data, [ 'numeric_fields' => $numeric_fields ]);

    // Получить id всех сообщений в чате
    case 'getMessageIds':
      $sql = 'SELECT NOW(0) AS `server_time`,' .
                'JSON_ARRAYAGG(`id_message`) AS `messages` ' .
                'FROM (' .
                  'SELECT *,ROW_NUMBER() OVER(ORDER BY `id_message`) AS `num` ' .
                  'FROM `message` ' .
                  'WHERE (' .
                      'SUBSTRING_INDEX(:chat_id,\':\',-1)=:u_id ' .
                      'OR EXISTS(SELECT 1 FROM `order` WHERE `id_order`=SUBSTRING_INDEX(:chat_id,\':\',1) AND `client`=:u_id)' .
                    ') ' .
                    'AND `recipient_owner_type`=31 ' .
                    'AND `recipient_owner`=:chat_id ' .
                    'AND `id_message_type` IN(1,31,32,33) ' .
                    'AND `active_status`>0 ' .
                ') `m`';
      return $query($sql, $data, [ 'json_fields' => ['messages'] ]);

    // Получить id всех сообщений в чате, обновлённых с заданного момента времени
    case 'getUpdatedMessageIds':
      $sql = 'SELECT NOW(0) AS `server_time`,' .
                  'JSON_ARRAYAGG(' .
                    'JSON_OBJECT(' .
                      '\'id\',`m`.`id_message`,' .
                      '\'del\',IF(`m`.`active_status`=0,1,0)' .
                    ')' .
                  ') `messages` ' .
                'FROM (' .
                  'SELECT `m`.*,ROW_NUMBER() OVER(ORDER BY `m`.`id_message`) AS `num` ' .
                  'FROM `message` `m`' .
                  'JOIN `order` `o` ' .
                  'LEFT JOIN `messages_read` `r1` ' .
                    'ON `r1`.`id_message`=`m`.`id_message` ' .
                    'AND `r1`.`id_user`=:u_id ' .
                  'LEFT JOIN `messages_read` `r2` ' .
                    'ON `r2`.`id_message`=`m`.`id_message` ' .
                    'AND `r2`.`id_user`=' . ($context['u_role'] === 2 ? '`o`.`client` ' : 'SUBSTRING_INDEX(:chat_id,\':\',-1) ') .
                  'WHERE `o`.`id_order`=SUBSTRING_INDEX(:chat_id,\':\',1) ' .
                    ($context['u_role'] === 2 ?
                      'AND SUBSTRING_INDEX(:chat_id,\':\',-1)=:u_id '
                    :
                      'AND `o`.`client`=:u_id '
                    ) .
                    'AND `m`.`recipient_owner_type`=31 ' .
                    'AND `m`.`recipient_owner`=:chat_id ' .
                    'AND `m`.`id_message_type` IN(1,31,32,33) ' .
                    'AND GREATEST(`m`.`create_datetime`,`m`.`last_edit_datetime`,IFNULL(`r1`.`read`,0),IFNULL(`r2`.`read`,0))>:since ' .
                ') `m`';
      return $query($sql, $data, [ 'json_fields' => ['messages'] ]);

    // Получить сообщения по списку id
    case 'getMessages':
      $sql = 'SELECT `m`.`id_message`  AS `id`,' .
                'IF(`m`.`sender_owner_type`=1,`m`.`sender_owner`,NULL) AS `from`,' .
                'CASE WHEN `m`.`id_message_type`=1 THEN `m`.`value` WHEN `m`.`id_message_type`=31 THEN `m`.`value`->>\'$.text\' ELSE NULL END AS `text`,' .
                'CASE WHEN `m`.`id_message_type`=31 THEN `m`.`value`->>\'$.eventType\' ELSE NULL END AS `event_type`,' .
                'CASE WHEN `m`.`id_message_type`=32 THEN `m`.`value`->>\'$.audio\' ELSE NULL END AS `audio_id`,' .
                'CASE WHEN `m`.`id_message_type`=33 THEN `m`.`value`->>\'$.caption\' ELSE NULL END AS `caption`,' .
                'CASE WHEN `m`.`id_message_type`=33 THEN `m`.`value`->>\'$.file\' ELSE NULL END AS `file_id`,' .
                '`m`.`last_edit_datetime` AS `modified`,' .
                '`m`.`last_edit_user` AS `editor`,' .
                '`m`.`create_datetime` AS `created`,' .
                '`m`.`create_user` AS `author`,' .
                '`m`.`id_message_type` AS `type`,' .
                '`m`.`id_message_upper` AS `related`,' .
                'IF((`m`.`sender_owner`<>:u_id OR `m`.`sender_owner_type`<>1) AND `r1`.`id_message` IS NULL,1,0) AS `unread`,' .
                '`r2`.`read` AS `partner_read_time` ' .
              'FROM `message` `m` ' .
              'JOIN `order` `o` ON `o`.`id_order`=SUBSTRING_INDEX(`recipient_owner`,\':\',1) ' .
              'LEFT JOIN `messages_read` `r1` ' .
                'ON `r1`.`id_message`=`m`.`id_message` ' .
                'AND `r1`.`id_user`=:u_id ' .
              'LEFT JOIN `messages_read` `r2` ' .
                'ON `r2`.`id_message`=`m`.`id_message` ' .
                'AND `r2`.`id_user`=' . ($context['u_role'] === 2 ? '`o`.`client` ' : 'SUBSTRING_INDEX(`m`.`recipient_owner`,\':\',-1) ') .
              'WHERE `m`.`id_message` IN(:ids) ' .
                  ($context['u_role'] === 2 ?
                    'AND SUBSTRING_INDEX(`m`.`recipient_owner`,\':\',-1)=:u_id '
                  :
                    'AND `o`.`client`=:u_id '
                  ) .
                'AND `m`.`active_status`>0 ' .
                'AND `m`.`recipient_owner_type`=31 ' .
                'AND `m`.`id_message_type` IN(1,31,32,33)';
      $numeric_fields = ['id', 'from', 'editor', 'author', 'type', 'audio_id', 'file_id', 'related', 'deleted', 'unread'];
      return $query($sql, $data, [ 'numeric_fields' => $numeric_fields ]);

    // Пометить сообщения прочитанными
    case 'markMessagesAsRead':
      $sql = 'INSERT IGNORE INTO `messages_read` ' .
                'SELECT `m`.`id_message`,' .
                  ':u_id AS `id_user`,' .
                  'NOW(0) AS `read` ' .
                'FROM `message` `m` ' .
                'JOIN `order` `o` ON `o`.`id_order`=SUBSTRING_INDEX(`recipient_owner`,\':\',1) ' .
                'WHERE `m`.`id_message` IN(:ids) ' .
                  ($context['u_role'] === 2 ?
                    'AND SUBSTRING_INDEX(`m`.`recipient_owner`,\':\',-1)=:u_id '
                  :
                    'AND `o`.`client`=:u_id '
                  ) .
                  'AND (`m`.`sender_owner`<>:u_id OR `m`.`sender_owner_type`<>1) ' .
                  'AND `m`.`active_status`>0 ' .
                  'AND `m`.`recipient_owner_type`=31 ' .
                  'AND `m`.`id_message_type` IN(1,31,32,33)';
      return $query($sql, $data);

    // Добавить сообщение
    case 'postMessage':
      $sql = 'INSERT INTO `message`(' .
                  '`sender_owner`,' .
                  '`sender_owner_type`,' .
                  '`recipient_owner`,' .
                  '`recipient_owner_type`,' .
                  '`name`,' .
                  '`value`,' .
                  '`last_edit_datetime`,' .
                  '`create_datetime`,' .
                  '`create_user`,' .
                  '`id_message_type`,' .
                  '`id_message_upper`' .
                ') SELECT ' .
                  ':u_id,' .                         // sender_owner
                  '1,' .                             // sender_owner_type
                  ':chat_id,' .                      // recipient_owner
                  '31,' .                            // recipient_owner_type
                  '\'\',' .                            // name
                  'CASE :type ' .                    // value
                    'WHEN 1 THEN :text ' .
                    'WHEN 32 THEN JSON_OBJECT(\'audio\',:file_id) ' .
                    'WHEN 33 THEN JSON_OBJECT(\'caption\',:text,\'file\',:file_id) ' .
                    'ELSE \'\' ' .
                  'END,' .
                  '0,' .                             // last_edit_datetime
                  'NOW(0),' .                         // create_datetime
                  ':u_id,' .                         // create_user
                  ':type,' .                         // id_message_type
                  ':reply_to ' .                     // id_message_upper
                'FROM `order` `o` ' .
                'JOIN `users` `u1` ON `u1`.`id_user`=`o`.`client` ' .
                'JOIN `users` `u2` ' .
                'WHERE `o`.`id_order`=SUBSTRING_INDEX(:chat_id,\':\',1) ' .
                'AND `u2`.`id_user`=SUBSTRING_INDEX(:chat_id,\':\',-1) ' .
                'AND JSON_VALID(`u1`.`json`) ' .
                'AND JSON_VALID(`u2`.`json`) ' .
                'AND JSON_CONTAINS(`u1`.`json`,CAST(`u2`.`id_user` AS JSON),\'$.blackList\') IS NOT TRUE ' .
                'AND JSON_CONTAINS(`u2`.`json`,CAST(`u1`.`id_user` AS JSON),\'$.blackList\') IS NOT TRUE ' .
                'AND (' .
                  'EXISTS(' .
                    'SELECT 1 FROM `order_driver` `d` ' .
                    'WHERE `d`.`id_user`=`u2`.`id_user` ' .
                      'AND `d`.`id_order`=`o`.`id_order` ' .
                      'AND `d`.`id_order_driver_status` IN(1,2,3,4,5,6) ' .
                      'AND `d`.`not_deleted`>0' .
                  ') OR EXISTS(' .
                    'SELECT 1 FROM `order_driver_select` `ds` ' .
                    'WHERE `ds`.`id_user`=`u2`.`id_user` ' .
                      'AND `ds`.`id_order`=`o`.`id_order` ' .
                      'AND `ds`.`cancel`=0 ' .
                  ')' .
                ') ' .
                'AND (:reply_to IS NULL OR EXISTS(' .
                  'SELECT 1 FROM `message` ' .
                  'WHERE `id_message`=:reply_to ' .
                  'AND `recipient_owner`=:chat_id ' .
                  'AND `recipient_owner_type`=31 ' .
                  'AND `id_message_type` IN(1,32,33)' .
                '))' .
                'AND :type IN(1,32,33) ' .
                'AND ' . ($context['u_role'] === 2 ? '`u2`.`id_user`=:u_id' : '`u1`.`id_user`=:u_id');
      return $query($sql, $data);

    // Открыть/закрыть чат
    case 'chatOpenClose':
      $sql = 'UPDATE `order` `o` ' .
                'LEFT JOIN `order_driver` `d` ' .
                  'ON `d`.`id_order`=`o`.`id_order` ' .
                  'AND `d`.`id_user`=SUBSTRING_INDEX(:id,\':\',-1) ' .
                  'AND `d`.`id_order_driver_status` IN(1,2,3,4,5,6) ' .
                  'AND `d`.`not_deleted`>0 ' .
                'LEFT JOIN `order_driver_select` `ds` ' .
                  'ON `ds`.`id_order`=`o`.`id_order` ' .
                  'AND `ds`.`id_user`=SUBSTRING_INDEX(:id,\':\',-1) ' .
                  'AND `ds`.`cancel`=0 ' .
                'SET ' .
                  '`o`.`options`=IFNULL(' .
                    'CASE ' .
                      'WHEN :u_role=1 AND :open>0 AND JSON_CONTAINS(`o`.`options`,CAST(IFNULL(`d`.`id_user`,`ds`.`id_user`) AS JSON),\'$.chatOpen\') IS NOT TRUE THEN ' .
                        'JSON_MERGE_PRESERVE(`o`.`options`,JSON_OBJECT(\'chatOpen\',JSON_ARRAY(IFNULL(`d`.`id_user`,`ds`.`id_user`)))) ' .
                      'WHEN :u_role=1 AND :open=0 AND JSON_CONTAINS(`o`.`options`,CAST(IFNULL(`d`.`id_user`,`ds`.`id_user`) AS JSON),\'$.chatOpen\') THEN ' .
                        'JSON_REMOVE(`o`.`options`,' .
                          'CONCAT(' .
                            '\'$.chatOpen[\',' .
                            'FIND_IN_SET(IFNULL(`d`.`id_user`,`ds`.`id_user`),REGEXP_REPLACE(`o`.`options`->\'$.chatOpen\',\'[\\\\[\\\\]\\\\s]\',\'\'))-1,' .
                            '\']\'' .
                          ')' .
                        ') ' .
                      'ELSE `o`.`options` ' .
                    'END,' .
                    '`o`.`options`' .
                  '),' .
                  '`d`.`options`=IFNULL(' .
                    'IF(:u_role=2,' .
                      'JSON_MERGE_PATCH(`d`.`options`,JSON_OBJECT(\'chatOpen\',:open>0)),' .
                      '`d`.`options`' .
                    '),' .
                    '`d`.`options`' .
                  '),' .
                  '`ds`.`order_select_type`=IF(:u_role=2,' .
                    'IF(:open>0,\'Active\',\'Processing\'),' .
                    '`ds`.`order_select_type`' .
                  ')' .
                'WHERE `o`.`id_order`=SUBSTRING_INDEX(:id,\':\',1) ' .
                  'AND `o`.`id_order_status` IN(1,2,3,4,6) ' .
                  'AND (`d`.`id_user` IS NOT NULL OR `ds`.`id_user` IS NOT NULL) ' .
                  'AND (' .
                    '(:u_role=1 AND `o`.`client`=:u_id) ' .
                    'OR (:u_role=2 AND (`d`.`id_user`=:u_id OR `ds`.`id_user`=:u_id))' .
                  ')';
      $query($sql, $data);

    default:
      $die(400, 'Unknown action');
    }
  }
  catch (Exception $e) {
    $die($e->getCode(), $e->getMessage());
  }
});
