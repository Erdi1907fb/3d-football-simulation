import importlib.util,pathlib,tempfile,json,unittest
spec=importlib.util.spec_from_file_location('import_heads',pathlib.Path(__file__).with_name('import-fm27.py'));M=importlib.util.module_from_spec(spec);spec.loader.exec_module(M)
class Identity(unittest.TestCase):
 def setUp(self):
  self.head={'name':'Ali Canon','names':['Ali Canon'],'ids':['shared'],'dateOfBirth':'2000-01-02T08:00Z','path':'test.glb.gz','clubs':['7']};self.manifest={'players':[self.head]}
 def test_id_collision_never_skips_another_person(self):
  self.assertFalse(M.has_identity(self.manifest,{'ids':['shared'],'names':['Other Player'],'dateOfBirth':'2000-01-02'}))
 def test_date_only_and_timestamp_bind_same_person(self):
  self.assertTrue(M.has_identity(self.manifest,{'ids':['shared'],'names':['Alí Canon'],'dateOfBirth':'2000-01-02'}));self.assertFalse(M.has_identity(self.manifest,{'ids':['shared'],'names':['Ali Canon'],'dateOfBirth':'2000-01-03'}))
 def test_static_roster_aliases_are_linked_without_changing_birthday(self):
  before=M.ROOT
  with tempfile.TemporaryDirectory() as t:
   M.ROOT=pathlib.Path(t);p=M.ROOT/'assets/player-profiles';p.mkdir(parents=True);(p/'club.json').write_text(json.dumps({'providerTeamId':'7','players':[{'id':'profile','name':'Ali Canon','dateOfBirth':'2000-01-02'}]}));(M.ROOT/'assets/club-rosters-v75.json').write_text(json.dumps({'teams':{'7':{'team':{'players':[{'id':'live','name':'Ali C.','aliases':['Ali Canon'],'dateOfBirth':'2000-01-02T07:00Z'}],'bench':[]}}}}));M.link_profile_identities(self.manifest,{'priorityProfileSlugs':['club','missing'],'players':[]});self.assertIn('profile',self.head['ids']);self.assertIn('live',self.head['ids']);self.assertEqual(self.head['dateOfBirth'],'2000-01-02T08:00Z')
  M.ROOT=before
 def test_ambiguous_existing_heads_never_link(self):
  self.manifest['players'].append({**self.head,'path':'other.glb.gz'});before=M.ROOT
  with tempfile.TemporaryDirectory() as t:
   M.ROOT=pathlib.Path(t);(M.ROOT/'assets').mkdir();(M.ROOT/'assets/club-rosters-v75.json').write_text(json.dumps({'teams':{}}));changes=M.link_profile_identities(self.manifest,{'priorityProfileSlugs':[],'players':[{'name':'Ali Canon','names':['Ali Canon'],'ids':['candidate'],'dateOfBirth':'2000-01-02','clubs':['7']}]});self.assertEqual(changes,[]);self.assertNotIn('candidate',self.head['ids'])
  M.ROOT=before
class SkinMaterial(unittest.TestCase):
 def test_skin_bit128_is_opaque_and_hair_keeps_mask(self):
  spec=importlib.util.spec_from_file_location('convert_heads',pathlib.Path(__file__).with_name('convert-pes.py'));c=importlib.util.module_from_spec(spec);spec.loader.exec_module(c)
  self.assertFalse(c.is_hair_material('face_bsm_alp','pes3DDF_Skin_Face',160))
  self.assertTrue(c.is_hair_material('hair_parts_bsm_alp','pes3DDF_Skin_Face',160))

class ClubSourceNames(unittest.TestCase):
 def test_legal_prefix_variants_are_same_but_other_clubs_are_distinct(self):
  import runpy
  key=runpy.run_path(str(pathlib.Path(__file__).with_name('extend-plan.py')))['club_key']
  self.assertEqual(key('RSC Anderlecht'),key('Anderlecht'))
  self.assertEqual(key('FK Crvena zvezda'),key('Crvena zvezda'))
  self.assertNotEqual(key('Red Star'),key('Crvena zvezda'))
  self.assertNotEqual(key('Manchester City'),key('Manchester United'))

class RebuildPreservation(unittest.TestCase):
 def test_unconfigured_sources_survive_rebuild(self):
  spec=importlib.util.spec_from_file_location('build_heads',pathlib.Path(__file__).with_name('build-library.py'));b=importlib.util.module_from_spec(spec);spec.loader.exec_module(b)
  old={'configured-pack|1':{'source':'configured-pack','sourceId':'1'},'fm27-realfaces-v2|2':{'source':'fm27-realfaces-v2','sourceId':'2'},'pes-community-public-free|3':{'source':'pes-community-public-free','sourceId':'3'}}
  self.assertEqual(b.retained_heads(old,[old['configured-pack|1']]),[old['fm27-realfaces-v2|2'],old['pes-community-public-free|3']])
 def test_missing_raw_pack_keeps_all_previously_installed_heads(self):
  spec=importlib.util.spec_from_file_location('build_heads',pathlib.Path(__file__).with_name('build-library.py'));b=importlib.util.module_from_spec(spec);spec.loader.exec_module(b)
  old={'pack|1':{'source':'pack','sourceId':'1'}}
  self.assertEqual(b.retained_heads(old,[]),list(old.values()))
if __name__=='__main__':unittest.main()
