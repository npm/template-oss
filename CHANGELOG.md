# Changelog

### [3.4.2](https://github.com/npm/template-oss/compare/v3.4.1...v3.4.2) (2022-04-22)


### Bug Fixes

* correctly set git user and email ([eb55928](https://github.com/npm/template-oss/commit/eb55928ada5db8657c57a568057aa886fa8dae4b))
* properly install and use glob ([9bf3126](https://github.com/npm/template-oss/commit/9bf3126b03c8fa8629004ceb0fe0de480fc451f9))

### [3.4.1](https://github.com/npm/template-oss/compare/v3.4.0...v3.4.1) (2022-04-15)


### Bug Fixes

* properly allow package-lock when lockfile=true ([c613429](https://github.com/npm/template-oss/commit/c613429d2b46d94561aa20a8d39ca969a30f4391))

## [3.4.0](https://github.com/npm/template-oss/compare/v3.3.2...v3.4.0) (2022-04-15)


### Features

* allow option to set npm bin in package.json ([32f7f7c](https://github.com/npm/template-oss/commit/32f7f7c3df80b40a7536182e72b883d77ba46e64))


### Bug Fixes

* dont create release please for private root pkg ([2f7dcfa](https://github.com/npm/template-oss/commit/2f7dcfa8c8f00677ad24ad15dd059556f1dfa1e8))
* lockfile setting adds lockfile to allowed gitignore ([c808c4f](https://github.com/npm/template-oss/commit/c808c4ffd8ed7d1c198736a815df15e9a68ebb9c))
* use ops+robot as git user for all ci ([aeb0162](https://github.com/npm/template-oss/commit/aeb0162f68358f5783f63868a0c7c79d327f87fe))

### [3.3.2](https://github.com/npm/template-oss/compare/v3.3.1...v3.3.2) (2022-04-06)


### Bug Fixes

* add pull requests permissions to release please ([#129](https://github.com/npm/template-oss/issues/129)) ([82064ff](https://github.com/npm/template-oss/commit/82064ff6f7cacaa2c5fb9ebad0eaee1209963f8e))

### [3.3.1](https://github.com/npm/template-oss/compare/v3.3.0...v3.3.1) (2022-04-06)


### Bug Fixes

* yaml newlines in release please action ([#127](https://github.com/npm/template-oss/issues/127)) ([a64af5d](https://github.com/npm/template-oss/commit/a64af5de1e340ff12ce833b9b0cf6b06615ec6cd))

## [3.3.0](https://github.com/npm/template-oss/compare/v3.2.2...v3.3.0) (2022-04-06)


### Features

* add audit and fund flags to install ([0555d67](https://github.com/npm/template-oss/commit/0555d670b6f4ebc5929e65af28daae1e34599369)), closes [#108](https://github.com/npm/template-oss/issues/108)
* add lockfile option to control npmrc and ci cache ([9ab4497](https://github.com/npm/template-oss/commit/9ab449797deda9d3c02d582def9c8eaec342e943))
* update root package-lock after workspace releases ([#125](https://github.com/npm/template-oss/issues/125)) ([bd3da0e](https://github.com/npm/template-oss/commit/bd3da0ebda3f7fa7c424379e07aa2863fc831feb))


### Bug Fixes

* explicitly set package-name for release please workspaces ([f6aa844](https://github.com/npm/template-oss/commit/f6aa84473c2fc70676ea4b2da356ea9e5a23d5b5))
* remove actions permission from post-dependabot ([a245bbc](https://github.com/npm/template-oss/commit/a245bbcb0f476b7e4426387af4e453c91e2ff97e))
* update comment link to github permissions ([#117](https://github.com/npm/template-oss/issues/117)) ([ba5907b](https://github.com/npm/template-oss/commit/ba5907b96343bec8059544736fa154c951353de5))


### Dependencies

* bump @npmcli/package-json from 1.0.1 to 2.0.0 ([#122](https://github.com/npm/template-oss/issues/122)) ([afe6fb1](https://github.com/npm/template-oss/commit/afe6fb17c31629751dfa512767a7a84739a2511c))

### [3.2.2](https://github.com/npm/template-oss/compare/v3.2.1...v3.2.2) (2022-03-29)


### Bug Fixes

* correct path key for workspace release ([a4ae34f](https://github.com/npm/template-oss/commit/a4ae34f85500747e66666891dde8c3e9acf5485c))
* dont write release please file for private workspace ([15c19c1](https://github.com/npm/template-oss/commit/15c19c179a79a79e9785bfcf5818cd4f6631480a))
* lint after post dependabot install ([da74ad9](https://github.com/npm/template-oss/commit/da74ad966ec5d0d000014258738772d3074d82f5))
* race conditiion when saving package.json ([cd3fee9](https://github.com/npm/template-oss/commit/cd3fee91d8bf54d6bd9b71406b9282c19aae0689))


### Dependencies

* yaml@2.0.0-11 ([a1e3c57](https://github.com/npm/template-oss/commit/a1e3c57a146238bda04ee80f50c8306b4aab36c3))

### [3.2.1](https://github.com/npm/template-oss/compare/v3.2.0...v3.2.1) (2022-03-29)


### Bug Fixes

* add root: true to eslint configs ([bd24358](https://github.com/npm/template-oss/commit/bd24358330d9c7ab672acccf5d9167bd62a11ee6))
* properly apply file changes and version update ([fa0b173](https://github.com/npm/template-oss/commit/fa0b1739bfd61c4911aac2a9888888a44e5be15c))
* rm security.md files from workspaces ([43f0d25](https://github.com/npm/template-oss/commit/43f0d259ec2013725adb88a061bcfd1fc7dcc070))

## [3.2.0](https://github.com/npm/template-oss/compare/v3.1.1...v3.2.0) (2022-03-25)


### Features

* ignore scripts for all ci installs ([#106](https://github.com/npm/template-oss/issues/106)) ([b9c9c95](https://github.com/npm/template-oss/commit/b9c9c95f0b922a8a163ebc6b7a3faf772dc05c23))


### Bug Fixes

* allow post-dependabot action to edit workflows ([#103](https://github.com/npm/template-oss/issues/103)) ([0ca9a9e](https://github.com/npm/template-oss/commit/0ca9a9ee6ee5493112395d313c3e5632b3d5d8f7))

### [3.1.2](https://github.com/npm/template-oss/compare/v3.1.1...v3.1.2) (2022-03-21)


### Bug Fixes

* allow post-dependabot action to edit workflows ([#103](https://github.com/npm/template-oss/issues/103)) ([0ca9a9e](https://github.com/npm/template-oss/commit/0ca9a9ee6ee5493112395d313c3e5632b3d5d8f7))

### [3.1.1](https://github.com/npm/template-oss/compare/v3.1.0...v3.1.1) (2022-03-21)


### Bug Fixes

* add back postinstall script ([#101](https://github.com/npm/template-oss/issues/101)) ([5d52140](https://github.com/npm/template-oss/commit/5d521408df8acdf61c699a0d072bb267195de698))

## [3.1.0](https://github.com/npm/template-oss/compare/v3.0.0...v3.1.0) (2022-03-17)


### Features

* require this packaged to be a pinned dep ([ea04dfb](https://github.com/npm/template-oss/commit/ea04dfbd55e41fd4c241aa3302339fec2d0671ea)), closes [#88](https://github.com/npm/template-oss/issues/88) [#93](https://github.com/npm/template-oss/issues/93)


### Bug Fixes

* change dependabot to increase-if-necessary ([#91](https://github.com/npm/template-oss/issues/91)) ([f20fb37](https://github.com/npm/template-oss/commit/f20fb375bc79a455133650dd94420fda6e4e97fb))
* only reference matrix in relavent actions ([f951c95](https://github.com/npm/template-oss/commit/f951c95d7a8a499d6a3f2dc1a44857a35902061e))
* use commitlint config via rc file only ([#95](https://github.com/npm/template-oss/issues/95)) ([dd84416](https://github.com/npm/template-oss/commit/dd84416ae973cb8ab43cda14cbbe4d7d612605b1))
* use proper path and node version in actions ([d5d546e](https://github.com/npm/template-oss/commit/d5d546e46d746e4380c905c2d1d725ef9b10163f))

## [3.0.0](https://github.com/npm/template-oss/compare/v2.9.2...v3.0.0) (2022-03-16)


### ⚠ BREAKING CHANGES

* bin scripts are now `template-oss-apply` and `template-oss-check` renamed apply props `rootRepo`, `rootModule`, `workspaceRepo`, `workspaceModule`

### Features

* **eslint:** support glob for windows ([#79](https://github.com/npm/template-oss/issues/79)) ([9a28510](https://github.com/npm/template-oss/commit/9a285107ef044ecc3d1fad68a036d3701adc549b))
* rewrite to make it more extensible ([#81](https://github.com/npm/template-oss/issues/81)) ([605ccbd](https://github.com/npm/template-oss/commit/605ccbd7ef0a2c36b7e1750a045cd390b226db46))


### Bug Fixes

* remove unsupported changelog-type option ([#89](https://github.com/npm/template-oss/issues/89)) ([38585d1](https://github.com/npm/template-oss/commit/38585d18ec5742755bf2a14f2a6b1a7317110e67))
* use npm-template-copy ([#76](https://github.com/npm/template-oss/issues/76)) ([9af2ad3](https://github.com/npm/template-oss/commit/9af2ad39ff2cd0b1928fa8ac23abd0bfd7ebb56f))


### Dependencies

* bump hosted-git-info from 4.1.0 to 5.0.0 ([#87](https://github.com/npm/template-oss/issues/87)) ([dbda2cd](https://github.com/npm/template-oss/commit/dbda2cd9bc1bf4e85c50b8115e3275ec6ee69c06))
* update @npmcli/map-workspaces requirement from ^2.0.1 to ^2.0.2 ([#82](https://github.com/npm/template-oss/issues/82)) ([666ac23](https://github.com/npm/template-oss/commit/666ac238681aea52875f56814a168873407000c0))

### [2.9.2](https://www.github.com/npm/template-oss/compare/v2.9.1...v2.9.2) (2022-03-02)


### Bug Fixes

* release-please workspace path ([#74](https://www.github.com/npm/template-oss/issues/74)) ([53365b1](https://www.github.com/npm/template-oss/commit/53365b1b403f490f255f7982f12da861136595db))

### [2.9.1](https://www.github.com/npm/template-oss/compare/v2.9.0...v2.9.1) (2022-03-02)


### Bug Fixes

* dependabot permissions ([#71](https://www.github.com/npm/template-oss/issues/71)) ([28396cf](https://www.github.com/npm/template-oss/commit/28396cfa6cbbddc375bd9da49d685b9c4dc2b790))

## [2.9.0](https://www.github.com/npm/template-oss/compare/v2.8.1...v2.9.0) (2022-03-01)


### Features

* add release-please workflow to workspace repo files ([#58](https://www.github.com/npm/template-oss/issues/58)) ([ad4be0d](https://www.github.com/npm/template-oss/commit/ad4be0d5100fa688a1181579f4146f075cded8d0))


### Dependencies

* bump @npmcli/fs from 1.1.1 to 2.0.1 ([#60](https://www.github.com/npm/template-oss/issues/60)) ([ecee70c](https://www.github.com/npm/template-oss/commit/ecee70cbd59541c580f76720cc2dfefb1f417603))

### [2.8.1](https://www.github.com/npm/template-oss/compare/v2.8.0...v2.8.1) (2022-02-23)


### Bug Fixes

* bare git push for post-dependabot action ([#56](https://www.github.com/npm/template-oss/issues/56)) ([176440e](https://www.github.com/npm/template-oss/commit/176440ebf9c20ae9f3aebd10bee231dc423957ed))

## [2.8.0](https://www.github.com/npm/template-oss/compare/v2.7.1...v2.8.0) (2022-02-22)


### Features

* remove standard from package.json ([72520ff](https://www.github.com/npm/template-oss/commit/72520ffd34acc61d30db10530a9f414d086763c7))


### Dependencies

* update @npmcli/fs requirement from ^1.1.0 to ^1.1.1 ([7207aaf](https://www.github.com/npm/template-oss/commit/7207aaf27003071057084b6cb1deebb09a51725a))
* update @npmcli/map-workspaces requirement from ^2.0.0 to ^2.0.1 ([#55](https://www.github.com/npm/template-oss/issues/55)) ([b957fa7](https://www.github.com/npm/template-oss/commit/b957fa75b20c0073e87bf6952419af59bc79714c))

### [2.7.1](https://www.github.com/npm/template-oss/compare/v2.7.0...v2.7.1) (2022-02-07)


### Bug Fixes

* run install when dependabot updates us ([5b49817](https://www.github.com/npm/template-oss/commit/5b49817ee15863e613d82bcb265f2f11246ec268))

## [2.7.0](https://www.github.com/npm/template-oss/compare/v2.6.0...v2.7.0) (2022-02-02)


### Features

* add codeql analysis ([68af6f0](https://www.github.com/npm/template-oss/commit/68af6f0c7811a7cbfb658b6c9d1a9b8788b75067))


### Bug Fixes

* **changelog:** Capitalize Dependencies ([55c26a7](https://www.github.com/npm/template-oss/commit/55c26a7decebd846b3c427cceb5296737ceae4d9))
* **commitlint:** don't lint subject-case ([75cb7e6](https://www.github.com/npm/template-oss/commit/75cb7e670640ddf103534b4b59af9dea57e2368d))
* **dependabot:** always increase deps ([fb441b1](https://www.github.com/npm/template-oss/commit/fb441b1243e26a4758f2abda091c1c9163034ce8))


### Dependencies

* update @npmcli/fs requirement from ^1.0.0 to ^1.1.0 ([aa3f37e](https://www.github.com/npm/template-oss/commit/aa3f37ee6b1f243140e3aec36ac96de7cb1ce981))

## [2.6.0](https://www.github.com/npm/template-oss/compare/v2.5.1...v2.6.0) (2022-02-01)


### Features

* add npm-template-copy bin ([#37](https://www.github.com/npm/template-oss/issues/37)) ([a5b17fd](https://www.github.com/npm/template-oss/commit/a5b17fdde120a5a1f4849fde00573755eaf9c7b4))


### Bug Fixes

* drop bash and powershell from windows CI ([#34](https://www.github.com/npm/template-oss/issues/34)) ([a77cec5](https://www.github.com/npm/template-oss/commit/a77cec536ab3a99d1b748a3c72eb11c6364780e8))
* try to workaround old npm not being able to update in windows ([#36](https://www.github.com/npm/template-oss/issues/36)) ([194c434](https://www.github.com/npm/template-oss/commit/194c434fae3c7b63ac5f5d6b3524e9c01e2efe84))

### [2.5.1](https://www.github.com/npm/template-oss/compare/v2.5.0...v2.5.1) (2022-01-17)


### Bug Fixes

* move non-windows ci.yml to correct location ([#32](https://www.github.com/npm/template-oss/issues/32)) ([0503263](https://www.github.com/npm/template-oss/commit/0503263444dd780b9fef72e1ffada1954ee05c77))

## [2.5.0](https://www.github.com/npm/template-oss/compare/v2.4.3...v2.5.0) (2022-01-11)


### Features

* windowsCI ([#30](https://www.github.com/npm/template-oss/issues/30)) ([38cf7b4](https://www.github.com/npm/template-oss/commit/38cf7b4b2484f4662098e7e8c4df1e41dcef99af))

### [2.4.3](https://www.github.com/npm/template-oss/compare/v2.4.2...v2.4.3) (2022-01-06)


### Bug Fixes

* namespaced workspaces create workflows ([#28](https://www.github.com/npm/template-oss/issues/28)) ([cf6924e](https://www.github.com/npm/template-oss/commit/cf6924ed7076c1e2d8e5bf8fe79dfc78a9eca9de))

### [2.4.2](https://www.github.com/npm/template-oss/compare/v2.4.1...v2.4.2) (2022-01-06)


### Bug Fixes

* updated workspace ci template to run correct tests ([#26](https://www.github.com/npm/template-oss/issues/26)) ([92764e1](https://www.github.com/npm/template-oss/commit/92764e16733cc4531bbcf7f7ecbc0ecda59321a5))

### [2.4.1](https://www.github.com/npm/template-oss/compare/v2.4.0...v2.4.1) (2021-12-14)


### Bug Fixes

* empty commit for eslint-config from [#24](https://www.github.com/npm/template-oss/issues/24) ([cc6bdea](https://www.github.com/npm/template-oss/commit/cc6bdea0a76059d66bee12fffb03ba5a1026fe75))

## [2.4.0](https://www.github.com/npm/template-oss/compare/v2.3.1...v2.4.0) (2021-12-14)


### Features

* add release process scripts ([#20](https://www.github.com/npm/template-oss/issues/20)) ([af7b9f5](https://www.github.com/npm/template-oss/commit/af7b9f534c2b6ea8bc0c58f3259d8e186ef7d051))
* add workspace support ([#21](https://www.github.com/npm/template-oss/issues/21)) ([1294318](https://www.github.com/npm/template-oss/commit/12943181f1de8fe6162b6f5d683c322a143a3f6c))
