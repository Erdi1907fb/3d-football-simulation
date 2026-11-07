<?php
declare(strict_types=1);
header('Content-Type: text/plain; charset=utf-8');
header('Cache-Control: no-store');
// Repairs only publicly served static assets. Never changes data, config or PHP.
$base=__DIR__.'/assets';$root=realpath($base);$ok=0;$failed=0;
if(!$root||!is_dir($root)){http_response_code(409);exit("assets klasörü bu dosyanın yanında bulunamadı.\nSite ZIP'ini public_html içine doğru konuma çıkartın.\n");}
function public_mode_fix(string $p,int $mode):void{global $ok,$failed;if(is_link($p))return;if(@chmod($p,$mode))$ok++;else $failed++;}
public_mode_fix($root,0755);
try{
 $it=new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root,FilesystemIterator::SKIP_DOTS),RecursiveIteratorIterator::SELF_FIRST);
 foreach($it as$f){if($f->isLink())continue;$p=$f->getPathname();$real=realpath($p);if(!$real||!str_starts_with($real,$root.DIRECTORY_SEPARATOR))continue;public_mode_fix($p,$f->isDir()?0755:0644);}
}catch(Throwable $e){$failed++;}
echo "Statik dosya izinleri düzeltildi: $ok\nDüzeltilemeyen: $failed\n\n";
if($failed){http_response_code(409);echo "Hostinger Dosya Yöneticisi'nde assets klasörü ve alt klasörlerine 755, içindeki dosyalara 644 izni verin.\n";}
else echo "assets klasörü ve alt klasörleri: 755\nStatik dosyalar: 644\n\nŞimdi ana sayfaya dönün ve Ctrl + F5 yapın.\n";
echo "\ndata, tahminler, maç kayıtları ve config değiştirilmedi.\n";
