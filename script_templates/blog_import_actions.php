<?php
// Included from repair_api.php inside its request scope.
$blog_import_root = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'repair-wizards-blog-import';

$blog_import_delete_tree = function($path) use (&$blog_import_delete_tree) {
  if (is_link($path) || is_file($path)) { @unlink($path); return; }
  if (!is_dir($path)) return;
  foreach (scandir($path) ?: [] as $entry) {
    if ($entry === '.' || $entry === '..') continue;
    $blog_import_delete_tree($path . DIRECTORY_SEPARATOR . $entry);
  }
  @rmdir($path);
};

$blog_import_admin = function($context) {
  if ((int)$context['u_id'] <= 0) throw new Exception('Unauthorized.', 401);
  if ((int)$context['u_role'] !== 4) throw new Exception('Administrator role 4 is required.', 403);
};

$blog_import_load = function($token, $uid) use ($blog_import_root) {
  if (!is_string($token) || !preg_match('/^[a-f0-9]{48}$/D', $token)) throw new Exception('Invalid import token.', 400);
  $dir = $blog_import_root . DIRECTORY_SEPARATOR . $token;
  $path = $dir . DIRECTORY_SEPARATOR . 'meta.json';
  if (!is_file($path) || is_link($path)) throw new Exception('Import session expired.', 404);
  $meta = json_decode((string)file_get_contents($path), true);
  if (!is_array($meta) || (int)($meta['uid'] ?? 0) !== (int)$uid ||
      (int)($meta['created'] ?? 0) < time() - 1800 || !is_array($meta['article'] ?? null)) {
    throw new Exception('Import session expired.', 404);
  }
  return [$dir, $meta];
};

$blog_import_preview = function($token, $uid) use ($blog_import_load) {
  [$dir, $meta] = $blog_import_load($token, $uid);
  $assets = [];
  $warnings = [];
  $bytes_total = 0;
  foreach ($meta['article']['assets'] as $asset) {
    $path = $dir . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $asset['file']);
    $bytes = file_get_contents($path);
    if ($bytes === false) throw new Exception('Preview asset missing: ' . $asset['file'], 400);
    if ($bytes_total + strlen($bytes) > 45000000) {
      $warnings[] = 'Крупные файлы пропущены в Preview; они будут доступны после импорта.';
      continue;
    }
    $ext = strtolower(pathinfo($asset['file'], PATHINFO_EXTENSION));
    $mime = ['svg'=>'image/svg+xml','png'=>'image/png','jpg'=>'image/jpeg','jpeg'=>'image/jpeg','webp'=>'image/webp','gif'=>'image/gif','avif'=>'image/avif','glb'=>'model/gltf-binary','gltf'=>'model/gltf+json'][$ext] ?? 'application/octet-stream';
    $assets[] = ['file'=>$asset['file'],'mime'=>$mime,'data'=>base64_encode($bytes)];
    $bytes_total += strlen($bytes);
  }
  return ['valid'=>true,'token'=>$token,'article'=>$meta['article'],'preview_assets'=>$assets,'warnings'=>$warnings];
};

$blog_import_validate = function($upload, $uid) use ($blog_import_root, $blog_import_delete_tree) {
  if (!class_exists('ZipArchive')) throw new Exception('PHP ZipArchive extension is required.', 500);
  if (!is_array($upload) || empty($upload['tmp_name']) || !is_uploaded_file($upload['tmp_name'])) throw new Exception('ZIP archive missing.', 400);
  if ((int)$upload['size'] < 1 || (int)$upload['size'] > 100 * 1024 * 1024) throw new Exception('ZIP must not exceed 100 MB.', 413);
  if (!is_dir($blog_import_root) && !@mkdir($blog_import_root, 0700, true) && !is_dir($blog_import_root)) throw new Exception('Cannot create temporary import storage.', 500);
  $token = bin2hex(random_bytes(24));
  $dir = $blog_import_root . DIRECTORY_SEPARATOR . $token;
  if (!@mkdir($dir, 0700, true)) throw new Exception('Cannot create temporary import session.', 500);
  $zip = new ZipArchive();
  if ($zip->open($upload['tmp_name']) !== true) { $blog_import_delete_tree($dir); throw new Exception('Invalid ZIP archive.', 400); }

  try {
    if ($zip->numFiles < 2 || $zip->numFiles > 2000) throw new Exception('ZIP entry count must be 2–2000.', 400);
    $files = [];
    $article_json = null;
    $total = 0;
    for ($i=0; $i<$zip->numFiles; $i++) {
      $stat = $zip->statIndex($i);
      if (!is_array($stat) || !isset($stat['name'])) throw new Exception('Invalid ZIP entry.', 400);
      $name = (string)$stat['name'];
      if (substr($name, -1) === '/') {
        if ($name !== 'media/') throw new Exception('Unexpected directory in ZIP: ' . $name, 400);
        continue;
      }
      if ($name === '' || strpos($name, "\0") !== false || strpos($name, '\\') !== false ||
          $name[0] === '/' || preg_match('/^[A-Za-z]:/', $name) ||
          preg_match('#(^|/)\.\.?(/|$)#', $name) ||
          !preg_match('#^(article\.json|media/[^/]+)$#uD', $name)) {
        throw new Exception('Unsafe or unsupported ZIP path: ' . $name, 400);
      }
      if (isset($files[$name])) throw new Exception('Duplicate ZIP entry: ' . $name, 400);
      $size = (int)($stat['size'] ?? 0);
      $compressed = (int)($stat['comp_size'] ?? 0);
      $total += $size;
      if ($total > 150 * 1024 * 1024) throw new Exception('Uncompressed ZIP size exceeds 150 MB.', 413);
      if ($size > 0 && ($compressed <= 0 || $size / max(1, $compressed) > 200)) throw new Exception('Suspicious compression ratio: ' . $name, 400);
      if ($name === 'article.json' && $size > 5 * 1024 * 1024) throw new Exception('article.json exceeds 5 MB.', 413);
      if (strpos($name, 'media/') === 0 && $size > 30 * 1024 * 1024) throw new Exception('Media file exceeds 30 MB: ' . $name, 413);
      $opsys=0; $attrs=0;
      if (method_exists($zip,'getExternalAttributesIndex') && $zip->getExternalAttributesIndex($i,$opsys,$attrs) &&
          $opsys === ZipArchive::OPSYS_UNIX && ((($attrs >> 16) & 0170000) === 0120000)) {
        throw new Exception('Symbolic links are not allowed in ZIP.', 400);
      }
      $data = $zip->getFromIndex($i);
      if ($data === false || strlen($data) !== $size) throw new Exception('Cannot extract ZIP entry: ' . $name, 400);
      $target = $dir . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $name);
      if (!is_dir(dirname($target)) && !@mkdir(dirname($target), 0700, true) && !is_dir(dirname($target))) throw new Exception('Cannot create temporary media directory.', 500);
      if (file_put_contents($target,$data,LOCK_EX) !== strlen($data)) throw new Exception('Cannot write temporary ZIP entry.', 500);
      $files[$name] = $size;
      if ($name === 'article.json') $article_json = $data;
    }
    $zip->close();
    if (!is_string($article_json)) throw new Exception('article.json must be at ZIP root.', 400);
    $article = json_decode($article_json,true,128);
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($article) || array_is_list($article)) throw new Exception('Invalid article.json: ' . json_last_error_msg(),400);

    $fail = function($message) { throw new Exception($message,400); };
    $string = function($value,$path) use($fail) { if (!is_string($value) || trim($value)==='') $fail($path . ' must be a non-empty string.'); };
    if (!in_array($article['format_version'] ?? null,['1.2','1.3'],true)) $fail('Unsupported format_version.');
    $string($article['title'] ?? null,'title');
    $string($article['summary'] ?? null,'summary');
    if (!is_array($article['topic'] ?? null) || array_is_list($article['topic'])) $fail('topic must be an object.');
    $string($article['topic']['name'] ?? null,'topic.name');
    if (!is_array($article['topic']['path'] ?? null) || !$article['topic']['path']) $fail('topic.path must be a non-empty array.');
    foreach ($article['topic']['path'] as $n=>$part) $string($part,'topic.path['.$n.']');
    if (!is_array($article['blocks'] ?? null) || !$article['blocks'] || count($article['blocks'])>200) $fail('blocks must contain 1–200 entries.');
    if (!is_array($article['assets'] ?? null)) $fail('assets must be an array.');

    $assets=[];
    foreach ($article['assets'] as $n=>$asset) {
      $path='assets['.$n.']';
      if (!is_array($asset) || array_is_list($asset)) $fail($path.' must be an object.');
      $file=$asset['file'] ?? null;
      if (!is_string($file) || !preg_match('#^media/[^/]+$#uD',$file)) $fail($path.'.file is unsafe.');
      if (isset($assets[$file])) $fail('Duplicate asset: '.$file);
      $ext=strtolower(pathinfo($file,PATHINFO_EXTENSION));
      $type=$asset['type'] ?? null;
      $format=strtolower((string)($asset['format'] ?? ''));
      $allowed=$type==='image'?['svg','png','jpg','jpeg','webp','gif','avif']:($type==='model_3d'?['glb','gltf']:[]);
      $exts=$format==='jpg'?['jpg','jpeg']:[$format];
      if (!$allowed || !in_array($format,$allowed,true) || !in_array($ext,$exts,true)) $fail($path.' has incompatible type/format/extension.');
      if (!isset($files[$file]) || !isset($asset['size_bytes']) || !is_int($asset['size_bytes']) || $asset['size_bytes']!==$files[$file]) $fail($path.' file or size_bytes does not match ZIP.');
      if ($type==='image' && $files[$file]>10*1024*1024) $fail($path.' image exceeds 10 MB.');
      $assets[$file]=$asset;
    }
    foreach ($files as $file=>$size) if ($file!=='article.json' && !isset($assets[$file])) $fail('Unregistered media file: '.$file);

    $safe_file=function($file,$path,$type=null) use($fail,$assets) {
      if (!is_string($file) || !isset($assets[$file])) $fail($path.' references missing or unregistered asset.');
      if ($type!==null && ($assets[$file]['type'] ?? null)!==$type) $fail($path.' references wrong asset type.');
    };
    $used=[];
    if (isset($article['cover'])) {
      if (!is_array($article['cover']) || array_is_list($article['cover'])) $fail('cover must be an object.');
      $safe_file($article['cover']['file'] ?? null,'cover.file','image');
      $string($article['cover']['alt'] ?? null,'cover.alt');
      $used[$article['cover']['file']]=true;
    }
    foreach ($article['blocks'] as $n=>$block) {
      $path='blocks['.$n.']';
      if (!is_array($block) || array_is_list($block)) $fail($path.' must be an object.');
      $type=$block['type'] ?? null;
      $optional=function($field) use($block,$string,$path) { if (isset($block[$field])) $string($block[$field],$path.'.'.$field); };
      switch ($type) {
        case 'heading':
          if (!is_int($block['level'] ?? null) || $block['level']<2 || $block['level']>4) $fail($path.'.level must be 2–4.');
          $string($block['text'] ?? null,$path.'.text'); break;
        case 'paragraph':
        case 'quote':
          $string($block['text'] ?? null,$path.'.text'); $optional('caption'); break;
        case 'image':
          $safe_file($block['file'] ?? null,$path.'.file','image'); $used[$block['file']]=true;
          $string($block['alt'] ?? null,$path.'.alt'); $optional('caption'); break;
        case 'gallery':
          if (!is_array($block['images'] ?? null) || count($block['images'])<2) $fail($path.'.images must contain at least two images.');
          foreach ($block['images'] as $i=>$image) {
            if (!is_array($image) || array_is_list($image)) $fail($path.'.images['.$i.'] must be an object.');
            $safe_file($image['file'] ?? null,$path.'.images['.$i.'].file','image'); $used[$image['file']]=true;
            $string($image['alt'] ?? null,$path.'.images['.$i.'].alt');
          } break;
        case 'video':
          $url=is_string($block['url'] ?? null)?parse_url($block['url']):false;
          if (!$url || ($url['scheme'] ?? '')!=='https' || !in_array(strtolower($url['host'] ?? ''),['youtube.com','www.youtube.com','m.youtube.com','youtu.be','www.youtube-nocookie.com'],true)) $fail($path.'.url must be a supported HTTPS YouTube URL.');
          $optional('caption'); break;
        case 'list':
          if (!in_array($block['style'] ?? null,['ordered','unordered'],true) || !is_array($block['items'] ?? null) || !$block['items']) $fail($path.' has invalid list style/items.');
          foreach ($block['items'] as $i=>$item) $string($item,$path.'.items['.$i.']'); break;
        case 'callout':
          if (!in_array($block['style'] ?? null,['info','warning','danger','tip'],true)) $fail($path.'.style is invalid.');
          $string($block['text'] ?? null,$path.'.text'); $optional('title'); break;
        case 'steps':
          if (!is_array($block['items'] ?? null) || !$block['items']) $fail($path.'.items must be non-empty.');
          foreach ($block['items'] as $i=>$step) {
            if (!is_array($step) || array_is_list($step)) $fail($path.'.items['.$i.'] must be an object.');
            $string($step['title'] ?? null,$path.'.items['.$i.'].title'); $string($step['text'] ?? null,$path.'.items['.$i.'].text');
            if (isset($step['warning'])) $string($step['warning'],$path.'.items['.$i.'].warning');
            if (!empty($step['image'])) { $safe_file($step['image'],$path.'.items['.$i.'].image','image'); $used[$step['image']]=true; }
          } break;
        case 'table':
          if (!is_array($block['headers'] ?? null) || !$block['headers'] || !is_array($block['rows'] ?? null)) $fail($path.' has invalid headers/rows.');
          foreach ($block['headers'] as $i=>$header) $string($header,$path.'.headers['.$i.']');
          foreach ($block['rows'] as $i=>$row) {
            if (!is_array($row) || count($row)!==count($block['headers'])) $fail($path.'.rows['.$i.'] has incorrect cell count.');
            foreach ($row as $cell) if (!is_string($cell)) $fail($path.'.rows['.$i.'] contains a non-string cell.');
          } break;
        case 'code':
          $string($block['language'] ?? null,$path.'.language'); $string($block['text'] ?? null,$path.'.text'); break;
        case 'model_3d':
          $safe_file($block['file'] ?? null,$path.'.file','model_3d'); $used[$block['file']]=true;
          $string($block['alt'] ?? null,$path.'.alt'); $optional('caption');
          $ext=strtolower(pathinfo($block['file'],PATHINFO_EXTENSION));
          $model=file_get_contents($dir.DIRECTORY_SEPARATOR.str_replace('/',DIRECTORY_SEPARATOR,$block['file']));
          if ($ext==='glb' && (substr($model,0,4)!=='glTF' || strlen($model)<12 || unpack('V',substr($model,4,4))[1]!==2)) $fail($path.'.file is not a GLB v2 model.');
          break;
        default: $fail($path.' has unsupported block type.');
      }
    }
    if (isset($article['technical_knowledge'])) {
      if (!is_array($article['technical_knowledge']) || array_is_list($article['technical_knowledge'])) $fail('technical_knowledge must be an object.');
      foreach (['objects','symptoms','causes','diagnostics','operations','tools','materials','safety'] as $key) {
        if (isset($article['technical_knowledge'][$key]) && !is_array($article['technical_knowledge'][$key])) $fail('technical_knowledge.'.$key.' must be an array.');
      }
      $walk=function($value,$path='technical_knowledge') use(&$walk,$safe_file,&$used,$fail) {
        if (!is_array($value)) return;
        if (isset($value['media_refs']) && is_array($value['media_refs'])) foreach ($value['media_refs'] as $i=>$media) {
          if (!is_array($media)) $fail($path.'.media_refs['.$i.'] must be an object.');
          $safe_file($media['file'] ?? null,$path.'.media_refs['.$i.'].file'); $used[$media['file']]=true;
        }
        foreach ($value as $key=>$child) if (is_array($child)) $walk($child,$path.'.'.$key);
      };
      $walk($article['technical_knowledge']);
    }
    foreach ($assets as $file=>$asset) if (!isset($used[$file])) $fail('Unused asset: '.$file);
    file_put_contents($dir.DIRECTORY_SEPARATOR.'meta.json',json_encode(['uid'=>(int)$uid,'created'=>time(),'article'=>$article],JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES),LOCK_EX);
    return $token;
  }
  catch (Throwable $e) {
    $zip->close(); $blog_import_delete_tree($dir); throw $e;
  }
};

$blog_import_save = function($token,$mode,$context) use(
  $blog_import_load,$blog_import_delete_tree,$blog_post_columns,$blog_status_column,
  $query,$query_one,$query_transaction,$query_commit
) {
  if (!in_array($mode,['upsert','insert_only','update_only'],true)) throw new Exception('Invalid import mode.',400);
  [$temp_dir,$meta]=$blog_import_load($token,$context['u_id']);
  if (!$blog_status_column) throw new Exception('Import blocked: blog_post has no publication status column. Apply the reviewed publication migration first.',409);
  $status_type=strtolower((string)($blog_post_columns[$blog_status_column]['Type'] ?? ''));
  if (in_array($blog_status_column,['status','blog_status'],true) &&
      (strpos($status_type,'enum')!==false || strpos($status_type,'char')!==false)) {
    if (strpos($status_type,'enum')!==false && strpos($status_type,"'draft'")===false) throw new Exception('Publication status enum does not contain draft.',409);
    $status='draft';
  } elseif (in_array($blog_status_column,['is_published','published'],true) && strpos($status_type,'int')!==false) {
    $status=0;
  } else throw new Exception('Numeric status mapping is not configured; import stopped.',409);

  $upload_root=getenv('BLOG_UPLOAD_ROOT');
  if (!$upload_root) $upload_root=rtrim((string)($_SERVER['DOCUMENT_ROOT'] ?? ''),DIRECTORY_SEPARATOR).DIRECTORY_SEPARATOR.'uploads'.DIRECTORY_SEPARATOR.'blog';
  if ($upload_root==='' || $upload_root===DIRECTORY_SEPARATOR.'uploads'.DIRECTORY_SEPARATOR.'blog') throw new Exception('BLOG_UPLOAD_ROOT or DOCUMENT_ROOT is required.',500);
  if (!is_dir($upload_root) && !@mkdir($upload_root,0755,true) && !is_dir($upload_root)) throw new Exception('Cannot create media storage root.',500);
  $root=realpath($upload_root);
  if (!$root || !is_writable($root) || is_link($upload_root)) throw new Exception('Media storage root is not writable/safe.',500);
  $base_url=getenv('BLOG_UPLOAD_BASE_URL') ?: '/uploads/blog';
  if (!preg_match('#^(?:/|https://)[A-Za-z0-9._~:/-]+$#D',$base_url)) throw new Exception('Invalid BLOG_UPLOAD_BASE_URL.',500);

  $article=$meta['article'];
  $topic=$query_one('SELECT id_blog_topic FROM blog_topic WHERE name=:name ORDER BY id_blog_topic LIMIT 1',['name'=>$article['topic']['name']],['numeric_fields'=>['id_blog_topic']]);
  if (!$topic) throw new Exception('Topic not found in blog_topic: '.$article['topic']['name'],409);
  $target_dir=null; $started=false;
  try {
    $query_transaction(); $started=true;
    $existing=$query_one('SELECT id_blog_post FROM blog_post WHERE id_blog_topic=:topic AND name=:name ORDER BY id_blog_post LIMIT 1 FOR UPDATE',
      ['topic'=>(int)$topic['id_blog_topic'],'name'=>$article['title']],['numeric_fields'=>['id_blog_post']]);
    if ($existing && $mode==='insert_only') { $query_commit(); $started=false; $blog_import_delete_tree($temp_dir); return ['action'=>'skipped_existing','id'=>(int)$existing['id_blog_post'],'title'=>$article['title']]; }
    if (!$existing && $mode==='update_only') { $query_commit(); $started=false; $blog_import_delete_tree($temp_dir); return ['action'=>'skipped_missing','id'=>null,'title'=>$article['title']]; }
    $id=$existing?(int)$existing['id_blog_post']:0;
    if (!$id) {
      $columns=['id_blog_topic','id_user','name','value','last_edit_datetime','last_edit_user','create_datetime'];
      $values=[':topic',':user',':name',':value','NOW(0)',':editor','NOW(0)'];
      $params=['topic'=>(int)$topic['id_blog_topic'],'user'=>(int)$context['u_id'],'name'=>$article['title'],'value'=>'{}','editor'=>(int)$context['u_id']];
      $columns[]=$blog_status_column; $values[]=':status'; $params['status']=$status;
      if (isset($blog_post_columns['published_at'])) { $columns[]='published_at'; $values[]='NULL'; }
      if (isset($blog_post_columns['content_json'])) { $columns[]='content_json'; $values[]=':content_json'; $params['content_json']='{}'; }
      if (isset($blog_post_columns['content_format'])) { $columns[]='content_format'; $values[]="'json'"; }
      if (isset($blog_post_columns['content_version'])) { $columns[]='content_version'; $values[]=':version'; $params['version']=$article['format_version']; }
      $result=$query('INSERT INTO blog_post('.implode(',',$columns).') VALUES('.implode(',',$values).')',$params,['text_fields'=>['name','value','content_json']]);
      if (empty($result['id'])) throw new Exception('Article insert failed.',500);
      $id=(int)$result['id'];
    }
    $target_dir=$root.DIRECTORY_SEPARATOR.$id.DIRECTORY_SEPARATOR.$token;
    if (file_exists($target_dir) || is_link($target_dir)) throw new Exception('Media destination already exists.',409);
    if (!is_dir(dirname($target_dir)) && !@mkdir(dirname($target_dir),0755,true) && !is_dir(dirname($target_dir))) throw new Exception('Cannot create media directory.',500);
    if (!@mkdir($target_dir,0755,true)) throw new Exception('Cannot create media version directory.',500);
    foreach ($article['assets'] as $asset) {
      $source=$temp_dir.DIRECTORY_SEPARATOR.str_replace('/',DIRECTORY_SEPARATOR,$asset['file']);
      if (!is_file($source) || !copy($source,$target_dir.DIRECTORY_SEPARATOR.basename($asset['file']))) throw new Exception('Cannot copy media: '.$asset['file'],500);
    }
    $article['media_base_url']=rtrim($base_url,'/').'/'.$id.'/'.$token.'/';
    $content=json_encode($article,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
    if (!is_string($content)) throw new Exception('Cannot encode article JSON.',500);
    $parts=['value=:value','last_edit_datetime=NOW(0)','last_edit_user=:editor',$blog_status_column.'=:status'];
    $params=['value'=>$content,'editor'=>(int)$context['u_id'],'status'=>$status,'id'=>$id];
    if (isset($blog_post_columns['published_at'])) $parts[]='published_at=NULL';
    if (isset($blog_post_columns['content_json'])) { $parts[]='content_json=:content_json'; $params['content_json']=$content; }
    if (isset($blog_post_columns['content_format'])) $parts[]="content_format='json'";
    if (isset($blog_post_columns['content_version'])) { $parts[]='content_version=:version'; $params['version']=$article['format_version']; }
    $query('UPDATE blog_post SET '.implode(',',$parts).' WHERE id_blog_post=:id',$params,['text_fields'=>['value','content_json']]);
    $query_commit(); $started=false; $blog_import_delete_tree($temp_dir);
    return ['action'=>$existing?'updated':'inserted','id'=>$id,'title'=>$article['title'],'status'=>'draft','media_base_url'=>$article['media_base_url']];
  } catch (Throwable $e) {
    if ($started) @query('ROLLBACK');
    if ($target_dir) $blog_import_delete_tree($target_dir);
    throw $e;
  }
};
