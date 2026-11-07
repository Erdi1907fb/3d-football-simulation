# v104 kaynak ve uygulama kaydı

- Mevcut Three.js (MIT) sahnesi ve render API'leri kullanıldı. Yeni HDR/kenar
  filtresi, çim, kumaş ve ışık düzeni Next90 Sim içinde yazıldı.
- [acherm/fifacher](https://github.com/acherm/fifacher), `src/postfx.js`: sahne
  doğrusal HDR → efekt → renk çıkışı sıralaması incelendi. Projenin oyun motoru,
  model veya shader dosyaları topluca kopyalanmadı; yeni filtre bağımsız uygulamadır.
- Mevcut MakeHuman/MPFB CC0 tam vücut karakteri 28 taraftar pozu için yerelde
  render edilerek atlas üretildi. Yeni harici taraftar fotoğrafı kullanılmadı.
- Önceki sürümlerdeki OpenFootball, deneysel OpenEngine, Yuka, Poly Haven,
  karakter ve ayak verisi kaynakları/attribution dosyaları korundu. Bu sürümde
  bunların eksik özellikleri çalışıyor kabul edilmedi veya tam motor alınmış denmedi.
- Taktik aday puanlama, karşılıklı kaçınma, gövde düzeltmesi, bot temas bağlantısı,
  gerçek kafa malzemesine fotoğraf izdüşümü ve logo yedek çözümleyicisi yerel uyarlama.
- Logo yedekleri mevcut paket resimlerinden üretildi; 229 katalog takımının
  tümü kapsandı. Mevcut marka ve takım varlıklarının kaynakları değiştirilmedi.

Uygulama mevcut çalışan v103'ün üzerindedir. Ayrıntılı doğrulama ve ölçüm sınırları
SURUM-v104.txt ile tests/browser-results-v104.json içinde yer alır.
