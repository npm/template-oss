# Changelog

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
