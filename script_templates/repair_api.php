<?php

$out = null;
ini_set( 'display_errors', 0 );

call_user_func(function() use(&$out) {
  $sql_queries = [
    'getContractorsByService' => [
      'sql' => 'SELECT `id_user` FROM `users` WHERE `id_role`=2 AND `id_city`=:cityId AND ' .
                '`active`>0 AND JSON_LENGTH(`json`->\'$.services.":serviceId"\') AND ' .
                '(:isOnline=0 OR `json`->"$.isOnline"=TRUE)'
    ],
    'markUserAsVerified' => [
      'sql' => 'UPDATE `users` SET `id_verification_status`=2 WHERE `id_user`=:u_id'
    ]
  ];

  $current_user_id = '';
  foreach ($_SESSION as $key => $val) {
    if (substr($key, 0, 4) === 'UID:') {
      $current_user_id = $val;
      break;
    }
  }
  $current_user_role = isset($_SESSION['id_role']) ? $_SESSION['id_role'] : 0;
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
  if (isset($sql_queries[$data['action']]['json_fields']) && is_array($sql_queries[$data['action']]['json_fields'])) {
    $json_fields = $sql_queries[$data['action']]['json_fields'];
  }
  else {
    $json_fields = [];
  }
  unset($data['action']);
  $data['u_id'] = $current_user_id;
  $data['u_role'] = $current_user_role;
  foreach ($data as &$value) {
    if (is_null($value)) {
      $value = 'NULL';
    }
    else {
      $value = real_escape_string($value);
      if (!is_numeric($value) || !is_finite($value)) $value = "'$value'";
    }
  }
  unset($value);
  $sql = preg_replace_callback(
    '/:([A-Za-z_]+)/',
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
          if (in_array($key, $json_fields)) {                                                                                                                            
            $decoded_json = json_decode($value, true);                                                                                                                   
            if (json_last_error() !== JSON_ERROR_NONE) {                                                                                                                 
              json_exit('500', 'error', "Failed to decode JSON field '$key': " . json_last_error_msg(), NULL);                                                           
            }                                                                                                                                                            
            $value = $decoded_json;                                                                                                                                      
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
});
