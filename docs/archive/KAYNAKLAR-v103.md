# v103 kaynakları

Önceki gerçek kod/varlık uyarlamaları KAYNAKLAR-v102.md içinde korunur.
Bu sürümün ayak veri alanı kaynakları:

- [dcaribou/transfermarkt-datasets](https://github.com/dcaribou/transfermarkt-datasets):
  players.csv.gz içinden 44.222 dolu ayak profili. Yalnız isim, kimlik, doğum ve
  foot alanları alındı. Kaynağın veri akışı Temmuz 2026'da durmuş; bu kaynak güncel
  kadro, teknik direktör veya sakatlık kanıtı olarak kullanılmadı.
- [m-mahadi/top5-football-dataset](https://github.com/m-mahadi/top5-football-dataset):
  data/clean/sofifa_players.csv, FC26 fotoğrafı, foot ve birth_year alanları.
- [FIFA23 veri örneği](https://gist.github.com/eyaltrabelsi/28ad39344d67e9e36b75bdda4c7a8a57):
  Preferred Foot, Name ve kaynak yaş aralığı. Yaşı kesin doğum tarihi saymadık.
- [FIFA20 örneği](https://gist.github.com/summer5e55/4a73923f90913b505f07bec24e341a79):
  long_name/short_name, dob ve preferred_foot.

Kaynaklar yalnız biyografik ayak alanı için kullanıldı; bu oyunların kodu, rating
modeli, animasyonu veya oyun motoru alınmadı. Top fiziği ve kafa yüzeyi izdüşümü
Next90 Sim'e özgü uyarlamadır. Bir kaynağın varlığı tüm kadronun güncel veya
her oyuncu ayağının doğrulanmış olduğunu göstermez. Alanın kaynak/estimated
bilgisi penalty kick.footEvidence ve preferred-foot çözümleyicisinde saklanır.
