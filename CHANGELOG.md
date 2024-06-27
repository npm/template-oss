# Changelog

## [4.23.0](https://github.com/npm/template-oss/compare/v4.22.0...v4.23.0) (2024-06-27)

### Features

* [`60ee94f`](https://github.com/npm/template-oss/commit/60ee94f58f085c9f85a73638501a1baac67507a7) [#447](https://github.com/npm/template-oss/pull/447) add prettier support (@lukekarrys, @jumoel)

### Bug Fixes

* [`b35bca5`](https://github.com/npm/template-oss/commit/b35bca55b28b41773aa6b936fc626bc15b40eae5) [#447](https://github.com/npm/template-oss/pull/447) run prettier (@lukekarrys)
* [`8aef509`](https://github.com/npm/template-oss/commit/8aef509c19639a08a47cf0378ea54799229891ff) [#446](https://github.com/npm/template-oss/pull/446) dont conclude checks if they were never set (#446) (@lukekarrys)
* [`9440c4f`](https://github.com/npm/template-oss/commit/9440c4f2a8292d4920d9a6d815a13dbd75146ecf) [#444](https://github.com/npm/template-oss/pull/444) pass releases to publish check (#444) (@lukekarrys)

### Dependencies

* [`8252fb2`](https://github.com/npm/template-oss/commit/8252fb28a4e6eb8ffb268f54f79b34f1af1dfe2d) [#452](https://github.com/npm/template-oss/pull/452) bump release-please from 16.10.2 to 16.12.0 (#452) (@dependabot[bot], @wraithgar)

### Chores

* [`b07d17a`](https://github.com/npm/template-oss/commit/b07d17a63391cbefbb08ffc1492460bfb6ce1a7c) [#448](https://github.com/npm/template-oss/pull/448) add .git-blame-ignore-revs for initial prettier (#448) (@lukekarrys)
* [`210247e`](https://github.com/npm/template-oss/commit/210247ef9622f2f3f9f9924ce30c68e471353896) [#447](https://github.com/npm/template-oss/pull/447) add prettier:true to template-oss config (@lukekarrys, @jumoel)
* [`1a073e4`](https://github.com/npm/template-oss/commit/1a073e477827cf8b49edbd694aca536dc545f1ec) [#443](https://github.com/npm/template-oss/pull/443) bump @npmcli/template-oss to 4.22.0 (@lukekarrys)

## [4.22.0](https://github.com/npm/template-oss/compare/v4.21.4...v4.22.0) (2024-05-03)

### Features

* [`21c9262`](https://github.com/npm/template-oss/commit/21c92624a9342d6fdbaafdf322ded5216b9188e5) [#440](https://github.com/npm/template-oss/pull/440) use macos-(latest|13) based on node version (#440) (@lukekarrys)

### Bug Fixes

* [`8b2e738`](https://github.com/npm/template-oss/commit/8b2e7382cd28c7d25dfaa320b3878443187fee88) [#432](https://github.com/npm/template-oss/pull/432) remove custom node-workspace plugin (@lukekarrys)
* [`0df268d`](https://github.com/npm/template-oss/commit/0df268d62802b613ce5015d3f30f12f92591dd90) [#442](https://github.com/npm/template-oss/pull/442) properly check for diff with multiple files from overwrite:false (#442) (@lukekarrys)
* [`2eca24b`](https://github.com/npm/template-oss/commit/2eca24bcfbfc1fad6cfa51cd44555e9c2dfc3536) [#441](https://github.com/npm/template-oss/pull/441) use git+https protocol for repo url (#441) (@lukekarrys)
* [`732dddc`](https://github.com/npm/template-oss/commit/732dddc38244f4e4a0d6e1a06da416a4d8519dac) [#439](https://github.com/npm/template-oss/pull/439) update actions workflow versions (#439) (@lukekarrys)
* [`7949ec3`](https://github.com/npm/template-oss/commit/7949ec36484786abeb1c425fb0d9c378064365b5) [#438](https://github.com/npm/template-oss/pull/438) add node 22 to CI matrix (#438) (@lukekarrys)
* [`6d54cbf`](https://github.com/npm/template-oss/commit/6d54cbf0016403779906d1f563d8ba249d2d9f0e) [#436](https://github.com/npm/template-oss/pull/436) get correct exit code from npm publish/view (#436) (@lukekarrys)
* [`d0bf7c2`](https://github.com/npm/template-oss/commit/d0bf7c28f9b3244132243067705a524abd18b84b) [#435](https://github.com/npm/template-oss/pull/435) update license (#435) (@lukekarrys)
* [`df03d8b`](https://github.com/npm/template-oss/commit/df03d8bec39e5e5245b272f1fc9c21556185a95d) [#433](https://github.com/npm/template-oss/pull/433) dont create chore only PRs (#433) (@lukekarrys)

### Dependencies

* [`dff1b5b`](https://github.com/npm/template-oss/commit/dff1b5b54b1393755d59169877cdb31b4466b524) [#432](https://github.com/npm/template-oss/pull/432) bump release-please from 16.3.1 to 16.10.2 (@dependabot[bot])

## [4.21.4](https://github.com/npm/template-oss/compare/v4.21.3...v4.21.4) (2024-04-15)

### Bug Fixes

* [`b8cf803`](https://github.com/npm/template-oss/commit/b8cf8032cde284cf56efb227b578c9bb16971fea) [#430](https://github.com/npm/template-oss/pull/430) only use latest template-oss specific commits in changelog (#430) (@lukekarrys)
* [`5d806ab`](https://github.com/npm/template-oss/commit/5d806abb13480ea10671ca475cc0d52be10f0790) [#429](https://github.com/npm/template-oss/pull/429) iterate over releases from env var (#429) (@lukekarrys)
* [`8906397`](https://github.com/npm/template-oss/commit/89063973726c720a4bbab251fa186f783f457ceb) [#423](https://github.com/npm/template-oss/pull/423) turn of body-max-line-length commitlint rule (@lukekarrys)

### Dependencies

* [`0b1c048`](https://github.com/npm/template-oss/commit/0b1c048135fd7edb877ef360e1c4479b5bac73b1) [#423](https://github.com/npm/template-oss/pull/423) `@commitlint/config-conventional@19.2.2`
* [`47e9d8d`](https://github.com/npm/template-oss/commit/47e9d8d5c1272d3dad23629c77b3d8105c529307) [#423](https://github.com/npm/template-oss/pull/423) bump @commitlint/cli from 18.6.1 to 19.0.3 (@dependabot[bot])
* [`41ee083`](https://github.com/npm/template-oss/commit/41ee08375c053a4f40050ed4e09324848174b0b8) [#425](https://github.com/npm/template-oss/pull/425) bump undici from 5.28.3 to 6.7.0 (#425) (@dependabot[bot])
* [`1106838`](https://github.com/npm/template-oss/commit/1106838f4c520855f56bf1ff7bac9f0231372635) [#427](https://github.com/npm/template-oss/pull/427) `proc-log@4.0.0` (#427)

## [4.21.3](https://github.com/npm/template-oss/compare/v4.21.2...v4.21.3) (2023-12-06)

### Bug Fixes

* [`acd6429`](https://github.com/npm/template-oss/commit/acd64294a39d7c53ca3c9142fbbf12419974d0cc) [#398](https://github.com/npm/template-oss/pull/398) dont allow release-please to update workspace changelogs (#398) (@lukekarrys)

## [4.21.2](https://github.com/npm/template-oss/compare/v4.21.1...v4.21.2) (2023-12-05)

### Bug Fixes

* [`8953024`](https://github.com/npm/template-oss/commit/89530240670cc01826c27c8794ca73c2e29505c1) [#394](https://github.com/npm/template-oss/pull/394) increase open dependabot limit (@lukekarrys)
* [`9e24894`](https://github.com/npm/template-oss/commit/9e24894b9a9db28f739ed31cd8c3426af11aa0fb) [#392](https://github.com/npm/template-oss/pull/392) do not collapse chores for now (#392) (@lukekarrys)

### Chores

* [`ed599cd`](https://github.com/npm/template-oss/commit/ed599cd3b1c3ec62324ff047d83c25dc45f70603) [#394](https://github.com/npm/template-oss/pull/394) ignore release-please coverage (@lukekarrys)

## [4.21.1](https://github.com/npm/template-oss/compare/v4.21.0...v4.21.1) (2023-12-04)

### Bug Fixes

* [`a64e952`](https://github.com/npm/template-oss/commit/a64e9522714e4eef570b20838821364cdf3d635e) [#389](https://github.com/npm/template-oss/pull/389) collapse chores in changelog (@lukekarrys)
* [`1df98ef`](https://github.com/npm/template-oss/commit/1df98ef0c80d47c29bfeb1e8d66e3d1636dbd5ad) [#389](https://github.com/npm/template-oss/pull/389) run install-latest-npm in temp dir (@lukekarrys)

## [4.21.0](https://github.com/npm/template-oss/compare/v4.20.0...v4.21.0) (2023-12-01)

### Features

* [`2daff23`](https://github.com/npm/template-oss/commit/2daff2347868ae2f711236515f8d6ef9ab70a811) [#334](https://github.com/npm/template-oss/pull/334) use upstream release-please (#334) (@lukekarrys)
* [`3d76fc4`](https://github.com/npm/template-oss/commit/3d76fc48ca2c73265737c3408cf7ccab75879cd8) [#380](https://github.com/npm/template-oss/pull/380) release workflow uses composite actions (#380) (@lukekarrys)

### Bug Fixes

* [`fbe355c`](https://github.com/npm/template-oss/commit/fbe355cfb4764d9b441a2af79eeba39e0a301a1c) [#388](https://github.com/npm/template-oss/pull/388) pin release-please version (#388) (@lukekarrys)
* [`4fad5d8`](https://github.com/npm/template-oss/commit/4fad5d899328ad59978dad248b40ca37c21e55fe) [#387](https://github.com/npm/template-oss/pull/387) make prerelease config switch versioning strategy (#387) (@lukekarrys)
* [`c892260`](https://github.com/npm/template-oss/commit/c89226086f536e1687a9ebf2d17cb7f6bad3b01a) [#386](https://github.com/npm/template-oss/pull/386) fallback to default release process of 404 from hosted version (#386) (@lukekarrys)
* [`9b22b83`](https://github.com/npm/template-oss/commit/9b22b83341003e4beb039e650097a4b94785dc42) [#384](https://github.com/npm/template-oss/pull/384) give release integration workflow correct permissions and secrets (#384) (@lukekarrys)

## [4.20.0](https://github.com/npm/template-oss/compare/v4.19.0...v4.20.0) (2023-11-15)

### Features

* [`17ea62d`](https://github.com/npm/template-oss/commit/17ea62ddae905344c50458e10a204cf13cb56aaf) [#371](https://github.com/npm/template-oss/pull/371) add typescript and esm support (@lukekarrys)
* [`ea0e866`](https://github.com/npm/template-oss/commit/ea0e8661e0a9759fed1a4044cb1f5905dad1942c) [#373](https://github.com/npm/template-oss/pull/373) update engines (#373) (@lukekarrys)

### Bug Fixes

* [`74331b4`](https://github.com/npm/template-oss/commit/74331b4a815fb83c69ee57c05d299c1a647b46c0) [#371](https://github.com/npm/template-oss/pull/371) remove tap 16 specific config when using tap 18 (@lukekarrys)
* [`3fca74f`](https://github.com/npm/template-oss/commit/3fca74f484b683ec204350d491a4eb201e882b85) [#371](https://github.com/npm/template-oss/pull/371) always lint all js-ish extensions (@lukekarrys)
* [`37e9e0e`](https://github.com/npm/template-oss/commit/37e9e0ed8eb5a0ff49531d5b9cb2105f81004358) [#371](https://github.com/npm/template-oss/pull/371) use npx semver to better determine latest npm (@lukekarrys)
* [`3e1792c`](https://github.com/npm/template-oss/commit/3e1792c441752d52bb3b446698dc6a0850b3b4de) [#362](https://github.com/npm/template-oss/pull/362) add suffix to template files (#362) (@rotu)
* [`ebb48ec`](https://github.com/npm/template-oss/commit/ebb48ecbf3dfffb6e21634528723267018f324af) [#368](https://github.com/npm/template-oss/pull/368) add PR approval to auto publish flow (#368) (@wraithgar)
* [`f065bcb`](https://github.com/npm/template-oss/commit/f065bcb147e8a8104848e594363540e1b056b548) [#366](https://github.com/npm/template-oss/pull/366) prefer upstream over origin when getting remote (@lukekarrys)
* [`29bf19d`](https://github.com/npm/template-oss/commit/29bf19d5b809b573185753321f5e498155c55f5b) [#364](https://github.com/npm/template-oss/pull/364) Ignore transient tap test directories (#364) (@wraithgar)

### Documentation

* [`2a8d79e`](https://github.com/npm/template-oss/commit/2a8d79ef33c939af4ee909dd7c851ce96db16d93) [#372](https://github.com/npm/template-oss/pull/372) add note about semver and breaking changes (#372) (@lukekarrys)

### Dependencies

* [`ec65582`](https://github.com/npm/template-oss/commit/ec65582767348658bb8a6f9040099ff704c03d1d) [#375](https://github.com/npm/template-oss/pull/375) bump @commitlint/config-conventional from 17.8.1 to 18.1.0
* [`c8420a6`](https://github.com/npm/template-oss/commit/c8420a6755609eba54886e6af5a123c57f2002eb) [#374](https://github.com/npm/template-oss/pull/374) bump @commitlint/cli from 17.8.1 to 18.2.0
* [`f2521ed`](https://github.com/npm/template-oss/commit/f2521edc63fd6bd313fdc3fdac8e3a3c0bd70af9) [#370](https://github.com/npm/template-oss/pull/370) bump @npmcli/arborist from 6.5.0 to 7.2.1
* [`8c20554`](https://github.com/npm/template-oss/commit/8c2055457c112e616a0529bfb5baa296d3bdecc9) [#346](https://github.com/npm/template-oss/pull/346) bump @npmcli/git from 4.1.0 to 5.0.3
* [`f25926a`](https://github.com/npm/template-oss/commit/f25926ab282975ea371700c6e8d17d454ab93777) [#343](https://github.com/npm/template-oss/pull/343) bump @npmcli/package-json from 4.0.1 to 5.0.0
* [`af30dbe`](https://github.com/npm/template-oss/commit/af30dbe3bbf4f410f31473f3df89b5893c01be62) [#357](https://github.com/npm/template-oss/pull/357) bump hosted-git-info from 6.1.1 to 7.0.1
* [`0b59cd6`](https://github.com/npm/template-oss/commit/0b59cd6bc32a48f69a7a46b6a7e9c28a106fcffe) [#349](https://github.com/npm/template-oss/pull/349) bump npm-package-arg from 10.1.0 to 11.0.1

## [4.19.0](https://github.com/npm/template-oss/compare/v4.18.1...v4.19.0) (2023-09-15)

### Features

* [`994a278`](https://github.com/npm/template-oss/commit/994a2784df4b76c5e0362e9877fb6ae63e94bd77) [#356](https://github.com/npm/template-oss/pull/356) set ci versions from engines (@lukekarrys)
* [`cad156a`](https://github.com/npm/template-oss/commit/cad156a3a929ab30c5d9e595443b22f399f3941c) [#360](https://github.com/npm/template-oss/pull/360) set backport release from config instead of current branch (@lukekarrys)

### Bug Fixes

* [`de319e8`](https://github.com/npm/template-oss/commit/de319e8b20e5ab64770add7a9b847a2c76d22159) [#358](https://github.com/npm/template-oss/pull/358) allow overriding path to npm bin in workspaces (@lukekarrys)

## [4.18.1](https://github.com/npm/template-oss/compare/v4.18.0...v4.18.1) (2023-09-12)

### Bug Fixes

* [`44123b8`](https://github.com/npm/template-oss/commit/44123b8719bb95a2addec741b1937c2f985cffa6) [#354](https://github.com/npm/template-oss/pull/354) install npm in CI based on node version (@lukekarrys)

## [4.18.0](https://github.com/npm/template-oss/compare/v4.17.0...v4.18.0) (2023-07-18)

### Features

* [`f04a76d`](https://github.com/npm/template-oss/commit/f04a76d48e373fb03249973983e45472b26a9691) [#330](https://github.com/npm/template-oss/pull/330) use git remote for branch related config (@lukekarrys)

### Bug Fixes

* [`dd9aadf`](https://github.com/npm/template-oss/commit/dd9aadf8d96c31066c84905cad07ac89a68ceead) [#337](https://github.com/npm/template-oss/pull/337) properly quote PR_TITLE (#337) (@wraithgar)
* [`4662ec3`](https://github.com/npm/template-oss/commit/4662ec31afc77f0e5fdac13d0bf14e23e0e9cb43) [#331](https://github.com/npm/template-oss/pull/331) block protected branch creations (@lukekarrys)

## [4.17.0](https://github.com/npm/template-oss/compare/v4.16.0...v4.17.0) (2023-07-07)

### Features

* [`4624d9c`](https://github.com/npm/template-oss/commit/4624d9c17e30b4783ef6bfc28a72603cc076f0e7) [#323](https://github.com/npm/template-oss/pull/323) add overwrite false property to added files (@lukekarrys)

### Bug Fixes

* [`710c25e`](https://github.com/npm/template-oss/commit/710c25e404df0f5be2ef1a487704e7235db3c348) [#327](https://github.com/npm/template-oss/pull/327) do not add dependabot files when config is falsy (@lukekarrys)
* [`449066e`](https://github.com/npm/template-oss/commit/449066e1917b5ff113aba396b12986f5db5d25da) [#323](https://github.com/npm/template-oss/pull/323) determine parser based on target filename (@lukekarrys)
* [`7300da4`](https://github.com/npm/template-oss/commit/7300da491ec1e596c5ad82434f7975a5e5a70f23) [#325](https://github.com/npm/template-oss/pull/325) apply settings to all requested branches (@lukekarrys)

### Dependencies

* [`2a5cd53`](https://github.com/npm/template-oss/commit/2a5cd532ce26b4fe66a6cb5a8b195c77e2520929) [#324](https://github.com/npm/template-oss/pull/324) bump @npmcli/package-json from 3.1.1 to 4.0.0

## [4.16.0](https://github.com/npm/template-oss/compare/v4.15.1...v4.16.0) (2023-07-05)

### Features

* [`6e02268`](https://github.com/npm/template-oss/commit/6e02268f12cc65da2180527a6a18f5d737bab6c3) [#321](https://github.com/npm/template-oss/pull/321) allow adding latest to other ci versions (@lukekarrys)
* [`b83a19a`](https://github.com/npm/template-oss/commit/b83a19a98ec5db85b96e645916dcb65dbc64fbbd) [#321](https://github.com/npm/template-oss/pull/321) add config option to disable eslint (@lukekarrys)
* [`9606606`](https://github.com/npm/template-oss/commit/9606606f0163d56b785620881d5b01985f9218e3) [#321](https://github.com/npm/template-oss/pull/321) add config option to not update npm (@lukekarrys)
* [`73d7bf1`](https://github.com/npm/template-oss/commit/73d7bf174d34c5d51b87f937daf52b94c9e803c4) [#321](https://github.com/npm/template-oss/pull/321) add release/v branches to all branch CI (@lukekarrys)

## [4.15.1](https://github.com/npm/template-oss/compare/v4.15.0...v4.15.1) (2023-05-03)

### Bug Fixes

* [`6f5a253`](https://github.com/npm/template-oss/commit/6f5a2533dadb48edc822a798a2cdda3dcd3e20b0) [#313](https://github.com/npm/template-oss/pull/313) make settings file actually work (#313) (@nlf)

## [4.15.0](https://github.com/npm/template-oss/compare/v4.14.1...v4.15.0) (2023-05-03)

### Features

* [`96776b4`](https://github.com/npm/template-oss/commit/96776b44d73e4695d1ddad07d9104830baa61f11) [#312](https://github.com/npm/template-oss/pull/312) add CONTRIBUTING.md (#312) (@wraithgar)
* [`be7f16a`](https://github.com/npm/template-oss/commit/be7f16a3662fbd2c0c5dacdf0b559f88dde81f7a) [#310](https://github.com/npm/template-oss/pull/310) add probot settings template (#310) (@nlf)

### Bug Fixes

* [`238fc4a`](https://github.com/npm/template-oss/commit/238fc4ae07fc9d05454c7f478dfe980b393c10f5) [#309](https://github.com/npm/template-oss/pull/309) pull PR_TITLE into env (@wraithgar)
* [`1edde27`](https://github.com/npm/template-oss/commit/1edde270606255276dc30ef1526970cac1b30644) [#308](https://github.com/npm/template-oss/pull/308) add the -R flag to the post-publish action for easier copy/paste (#308) (@nlf)
* [`1babe54`](https://github.com/npm/template-oss/commit/1babe54a8db71b40cf0eaabf3ee056796ba333ae) [#306](https://github.com/npm/template-oss/pull/306) use a more portable means of spawning subshells (#306) (@nlf)
* [`7a2481c`](https://github.com/npm/template-oss/commit/7a2481c7312a539bfdba6881ac8fbadae41c64b9) [#305](https://github.com/npm/template-oss/pull/305) update the LouisBrunner/checks-action to latest (#305) (@nlf)

## [4.14.1](https://github.com/npm/template-oss/compare/v4.14.0...v4.14.1) (2023-04-19)

### Bug Fixes

* [`f8976ca`](https://github.com/npm/template-oss/commit/f8976ca3a18ff6924c656cd486c9691f613d833f) [#303](https://github.com/npm/template-oss/pull/303) add id-token access to publish action (#303) (@wraithgar)

## [4.14.0](https://github.com/npm/template-oss/compare/v4.13.0...v4.14.0) (2023-04-19)

### Features

* [`31ce960`](https://github.com/npm/template-oss/commit/31ce960dd269d0560fe9496b287efd1bbe4f01aa) [#302](https://github.com/npm/template-oss/pull/302) publish with provenance (#302) (@wraithgar)

### Dependencies

* [`d17e7d9`](https://github.com/npm/template-oss/commit/d17e7d9b7593f6a97038c8b01c35cf9b3fae9497) [#300](https://github.com/npm/template-oss/pull/300) bump glob from 9.3.5 to 10.1.0 (#300)

## [4.13.0](https://github.com/npm/template-oss/compare/v4.12.1...v4.13.0) (2023-03-23)

### Features

* [`7102893`](https://github.com/npm/template-oss/commit/7102893c56e12edff3b236379e13cf11d3e4dca7) [#296](https://github.com/npm/template-oss/pull/296) add autopublish (#296) (@lukekarrys)

### Bug Fixes

* [`9a21a17`](https://github.com/npm/template-oss/commit/9a21a17f565588706d8073f7e14c29cf0d65f18b) [#297](https://github.com/npm/template-oss/pull/297) only show test step for manual publish (#297) (@lukekarrys)

### Dependencies

* [`f92b1ca`](https://github.com/npm/template-oss/commit/f92b1ca2bfc29dfc8c7144dce4bf1d1ae8dd8262) [#294](https://github.com/npm/template-oss/pull/294) bump ini from 3.0.1 to 4.0.0 (#294)

## [4.12.1](https://github.com/npm/template-oss/compare/v4.12.0...v4.12.1) (2023-03-21)

### Dependencies

* [`07bec3b`](https://github.com/npm/template-oss/commit/07bec3b404af1ae329f284985edfa2f363668c4e) [#293](https://github.com/npm/template-oss/pull/293) bump glob from 8.1.0 to 9.3.1 (#293)
* [`fb95639`](https://github.com/npm/template-oss/commit/fb956392cfcdf0cc3679ce7cb3911e00f058adcc) [#290](https://github.com/npm/template-oss/pull/290) bump just-diff from 5.2.0 to 6.0.0 (#290)

## [4.12.0](https://github.com/npm/template-oss/compare/v4.11.4...v4.12.0) (2023-02-13)

### Features

* [`6984cbd`](https://github.com/npm/template-oss/commit/6984cbdeafcc118824b4400729e4f308bf5dc18d) [#285](https://github.com/npm/template-oss/pull/285) update SECURITY.md (#285) (@lukekarrys)

### Bug Fixes

* [`241dbf2`](https://github.com/npm/template-oss/commit/241dbf27d7df953839de7a7ed128facf55b2464d) [#282](https://github.com/npm/template-oss/pull/282) tag codeowner for all release ci runs that are not success (#282) (@lukekarrys)
* [`dc73ffe`](https://github.com/npm/template-oss/commit/dc73ffe1748397d600b385a3fbde23d790f6f1ff) [#281](https://github.com/npm/template-oss/pull/281) remove deprecated set-output in favor of GITHUB_OUTPUT (#281) (@lukekarrys)
* [`f283d4a`](https://github.com/npm/template-oss/commit/f283d4a99bf9c22bd66fce327cd5665d0406bb5d) [#279](https://github.com/npm/template-oss/pull/279) add pull request numbers to all rebased commits (#279) (@lukekarrys)

## [4.11.4](https://github.com/npm/template-oss/compare/v4.11.3...v4.11.4) (2023-02-07)

### Bug Fixes

* [`5e6b26d`](https://github.com/npm/template-oss/commit/5e6b26db971e1835318ad9357ada20400354e794) [#277](https://github.com/npm/template-oss/pull/277) add logging for release comments (@lukekarrys)
* [`46d1d14`](https://github.com/npm/template-oss/commit/46d1d1449b5422cde064dea37aead7edb4e6746d) add release.yml input to rerun jobs on a merged release (@lukekarrys)
* [`6a1dcac`](https://github.com/npm/template-oss/commit/6a1dcac283d4b75c9737dd2a813ff78d932a564c) add more logging to release please action (@lukekarrys)

## [4.11.3](https://github.com/npm/template-oss/compare/v4.11.2...v4.11.3) (2023-01-25)

### Bug Fixes

* [`657286c`](https://github.com/npm/template-oss/commit/657286c4594647141b0dc7b167ae6fd2dfa4eeed) [#273](https://github.com/npm/template-oss/pull/273) wrap pr title and base_ref in quotes (@nlf)

## [4.11.2](https://github.com/npm/template-oss/compare/v4.11.1...v4.11.2) (2023-01-24)

### Bug Fixes

* [`8dac23a`](https://github.com/npm/template-oss/commit/8dac23ab285582afe7cdd2b463a5f1e3b1f3cb00) [#271](https://github.com/npm/template-oss/pull/271) capture exit code from npm view (@lukekarrys)

## [4.11.1](https://github.com/npm/template-oss/compare/v4.11.0...v4.11.1) (2023-01-24)

### Bug Fixes

* [`f4ce7d2`](https://github.com/npm/template-oss/commit/f4ce7d2559437ae10814cbf26986f51367d23f5a) [#269](https://github.com/npm/template-oss/pull/269) add root release and release pr to data (@lukekarrys)

## [4.11.0](https://github.com/npm/template-oss/compare/v4.10.0...v4.11.0) (2022-12-06)

### Features

* [`bf5f727`](https://github.com/npm/template-oss/commit/bf5f727f520e7b1db3f1126886212211f669a098) [#265](https://github.com/npm/template-oss/pull/265) link workspace changelog entries to release (@lukekarrys)

## [4.10.0](https://github.com/npm/template-oss/compare/v4.9.0...v4.10.0) (2022-11-10)

### Features

* [`3fcf46c`](https://github.com/npm/template-oss/commit/3fcf46c801d0a86e0de90b235e0daa3f028a828e) add npmSpec config item (@lukekarrys)
* [`e4465dd`](https://github.com/npm/template-oss/commit/e4465ddbfcafe7d0a3dc890e5f8b8319147d116b) merge npmrc files (@lukekarrys)

### Bug Fixes

* [`110b63a`](https://github.com/npm/template-oss/commit/110b63a4ad3fe48c24cb6db90b7879bfc14408b6) [#262](https://github.com/npm/template-oss/pull/262) use ci or update for release checklist (@lukekarrys)
* [`dfbdadc`](https://github.com/npm/template-oss/commit/dfbdadcb85f2631f78af05c2abfbaa317b17cbd1) properly recreate release PR when run via workflow_dispatch (@lukekarrys)

## [4.9.0](https://github.com/npm/template-oss/compare/v4.8.0...v4.9.0) (2022-11-09)

### Features

* [`1323cdb`](https://github.com/npm/template-oss/commit/1323cdb3328f94c1d8fb161ecbd751a74a4908b4) Updated SECURITY.md (@maclarel)

## [4.8.0](https://github.com/npm/template-oss/compare/v4.7.1...v4.8.0) (2022-10-27)

### Features

* [`2c9e34c`](https://github.com/npm/template-oss/commit/2c9e34c771eda2d1f33be8defd84f9c7946f012c) [#255](https://github.com/npm/template-oss/pull/255) only fail on production `audit` (@lukekarrys)
* [`49a0581`](https://github.com/npm/template-oss/commit/49a05818b7e721c223e6187a1f534a7a304f77fa) [#254](https://github.com/npm/template-oss/pull/254) replace --engines-strict check with arborist query (@lukekarrys)

## [4.7.1](https://github.com/npm/template-oss/compare/v4.7.0...v4.7.1) (2022-10-25)

### Bug Fixes

* [`2ef9995`](https://github.com/npm/template-oss/commit/2ef9995b07e5fd3662c567349646484f3b08dccc) apply dogfood to this repos workspaces also (@lukekarrys)
* [`9bdad61`](https://github.com/npm/template-oss/commit/9bdad61c1f73853b5198eea1e744994f286987a8) dont release specific apply changes based on public/private (@lukekarrys)
* [`3d7e5e8`](https://github.com/npm/template-oss/commit/3d7e5e8e81b1606babcb73dd9dc5713402000f0e) conclude check should only run with a check_id (@lukekarrys)

## [4.7.0](https://github.com/npm/template-oss/compare/v4.6.2...v4.7.0) (2022-10-25)

### Features

* [`49a17fe`](https://github.com/npm/template-oss/commit/49a17fe9025cf89ec983a90f0fe7ee88470ce0b6) [#247](https://github.com/npm/template-oss/pull/247) treat all `release/v*` branches as release targets (#247) (@lukekarrys)

### Bug Fixes

* [`b836015`](https://github.com/npm/template-oss/commit/b83601540f93b9b3a83e8dc0367ba1259c6ab93e) [#248](https://github.com/npm/template-oss/pull/248) allow ci-release workflow to be dispatched (@lukekarrys)
* [`254086a`](https://github.com/npm/template-oss/commit/254086a1e00d50791dcd5ca3060432aaa4f830ae) make post dependabot commit a regular non-breaking chore (@lukekarrys)

## [4.6.2](https://github.com/npm/template-oss/compare/v4.6.1...v4.6.2) (2022-10-18)

### Bug Fixes

* [`a722962`](https://github.com/npm/template-oss/commit/a722962521b049f45c690d861fe5fccafa91321a) [#244](https://github.com/npm/template-oss/pull/244) account for new npm-package-arg behavior (@wraithgar)

### Dependencies

* [`6fe7663`](https://github.com/npm/template-oss/commit/6fe7663cd7ee5bbb76be672f4936302156242603) bump npm-package-arg from 9.1.2 to 10.0.0

## [4.6.1](https://github.com/npm/template-oss/compare/v4.6.0...v4.6.1) (2022-10-17)

### Bug Fixes

* [`98db362`](https://github.com/npm/template-oss/commit/98db362680158124c4da2ad4b56d2db7238de0ed) correct mismatched step ids in post dependabot (@lukekarrys)

## [4.6.0](https://github.com/npm/template-oss/compare/v4.5.1...v4.6.0) (2022-10-14)

### Features

* [`2175b67`](https://github.com/npm/template-oss/commit/2175b67268e56f8e1d2ceb1892d61c378883f606) [#237](https://github.com/npm/template-oss/pull/237) add workflow dispatch to rerun release ci (@lukekarrys)

### Bug Fixes

* [`09bcd64`](https://github.com/npm/template-oss/commit/09bcd6486133d4cb9ab5396868de839649de00be) [#236](https://github.com/npm/template-oss/pull/236) remove npmcli/fs dep (@lukekarrys)
* [`2fef1e8`](https://github.com/npm/template-oss/commit/2fef1e81c993646eaf903a7b8999c2bad124111b) [#235](https://github.com/npm/template-oss/pull/235) refactor audit command into a separate file for overriding (@lukekarrys)

### Dependencies

* [`47eae35`](https://github.com/npm/template-oss/commit/47eae35c2fe41b5445f7404fe7b6ce1eb6d97e40) [#242](https://github.com/npm/template-oss/pull/242) bump @npmcli/git from 3.0.2 to 4.0.0 (#242)
* [`243a23f`](https://github.com/npm/template-oss/commit/243a23f829b07530c5245096431d6776cf27e20b) [#241](https://github.com/npm/template-oss/pull/241) bump @npmcli/map-workspaces from 2.0.4 to 3.0.0 (#241)
* [`179f02a`](https://github.com/npm/template-oss/commit/179f02aa170671466df8f11656f64858f3c20b25) [#240](https://github.com/npm/template-oss/pull/240) bump proc-log from 2.0.1 to 3.0.0 (#240)
* [`faf1ba0`](https://github.com/npm/template-oss/commit/faf1ba0bd465d8ac118c61a412e7a68f795d016c) [#238](https://github.com/npm/template-oss/pull/238) bump @npmcli/package-json from 2.0.0 to 3.0.0 (#238)
* [`eaaf3d9`](https://github.com/npm/template-oss/commit/eaaf3d9f79ef4979f2495a806bd4f03f35a5d037) [#234](https://github.com/npm/template-oss/pull/234) bump hosted-git-info from 5.1.0 to 6.0.0
* [`f499ac5`](https://github.com/npm/template-oss/commit/f499ac5b4bf907d72421c0eebe3f62074412f40c) [#231](https://github.com/npm/template-oss/pull/231) bump json-parse-even-better-errors from 2.3.1 to 3.0.0

## [4.5.1](https://github.com/npm/template-oss/compare/v4.5.0...v4.5.1) (2022-10-08)

### Bug Fixes

* [`bc72b05`](https://github.com/npm/template-oss/commit/bc72b05884dc59cd5f45b6f29f3308aad0456e7a) [#230](https://github.com/npm/template-oss/pull/230) add individual workspace flag to lint step (@lukekarrys)

### Dependencies

* [`0ccfc17`](https://github.com/npm/template-oss/commit/0ccfc17f1c4033575cc66c67513baf85a9f2b047) [#228](https://github.com/npm/template-oss/pull/228) `@npmcli/release-please@14.2.6`

## [4.5.0](https://github.com/npm/template-oss/compare/v4.4.5...v4.5.0) (2022-10-05)

### Features

* [`aef199e`](https://github.com/npm/template-oss/commit/aef199e300b3bb00d7631b86ca09d6d3d1b86386) [#221](https://github.com/npm/template-oss/pull/221) add default release-manager script (#221) (@lukekarrys)

### Bug Fixes

* [`b313218`](https://github.com/npm/template-oss/commit/b313218153e55d83713c8d8830e74a1d0d412098) [#226](https://github.com/npm/template-oss/pull/226) dont use -ws flags in release workflow when not necessary (#226) (@lukekarrys)
* [`f6a0268`](https://github.com/npm/template-oss/commit/f6a02684cd5742274ac33efc6efa89707d013bcc) [#225](https://github.com/npm/template-oss/pull/225) bump workspace dev deps with a deps commit (#225) (@lukekarrys)
* [`298600d`](https://github.com/npm/template-oss/commit/298600db3509f5bab469caa95fd73ceedc42cde4) [#224](https://github.com/npm/template-oss/pull/224) use head.ref for post dependabot checkout (#224) (@lukekarrys)

## [4.4.5](https://github.com/npm/template-oss/compare/v4.4.4...v4.4.5) (2022-10-04)

### Bug Fixes

* [`6ecdea4`](https://github.com/npm/template-oss/commit/6ecdea4580e00bb3fe80ca4765f055521c51d4ce) [#222](https://github.com/npm/template-oss/pull/222) fallback to lower bound of range for engines check (@lukekarrys)

## [4.4.4](https://github.com/npm/template-oss/compare/v4.4.3...v4.4.4) (2022-09-30)

### Bug Fixes

* [`6a2b97b`](https://github.com/npm/template-oss/commit/6a2b97b2dafcef7d795c51d3b01830c4fcda7c25) use github.ref_name for post dependabot checkout (@lukekarrys)

## [4.4.3](https://github.com/npm/template-oss/compare/v4.4.2...v4.4.3) (2022-09-29)

### Bug Fixes

* [`e21239e`](https://github.com/npm/template-oss/commit/e21239e0dea2dae585102878a4fc13e8ae7cae7a) [#218](https://github.com/npm/template-oss/pull/218) checkout head ref name in post dependabot (@lukekarrys)

## [4.4.2](https://github.com/npm/template-oss/compare/v4.4.1...v4.4.2) (2022-09-23)

### Bug Fixes

* [`8e16dc7`](https://github.com/npm/template-oss/commit/8e16dc76d9a469dd9caa73062e0983bef6792c82) [#216](https://github.com/npm/template-oss/pull/216) remove leading slash from dependabot metadata dir (@lukekarrys)

### Dependencies

* [`53bb928`](https://github.com/npm/template-oss/commit/53bb928258aa271c65a9b6d77c8e4cf6d60bbebe) `@npmcli/release-please@14.2.5`

## [4.4.1](https://github.com/npm/template-oss/compare/v4.4.0...v4.4.1) (2022-09-22)

### Bug Fixes

* [`1649552`](https://github.com/npm/template-oss/commit/1649552c86016ae422407610f9be848b0dfd8bae) only extend underscore partial files (@lukekarrys)

## [4.4.0](https://github.com/npm/template-oss/compare/v4.3.2...v4.4.0) (2022-09-22)

### Features

* [`d4ddfca`](https://github.com/npm/template-oss/commit/d4ddfca7d1c9077dedbf0e751bb133b9c79ed1b6) [#213](https://github.com/npm/template-oss/pull/213) allow extending partials (#213) (@lukekarrys)
* [`88f8387`](https://github.com/npm/template-oss/commit/88f8387ee90d7ee964ad40b4b90570c18b602ce5) [#212](https://github.com/npm/template-oss/pull/212) add a strict engines check to ci (#212) (@lukekarrys)
* [`2fdcddd`](https://github.com/npm/template-oss/commit/2fdcddd615066178cd1e84e2cd2144e9b4c566ef) [#180](https://github.com/npm/template-oss/pull/180) make template-oss postinstall commit a breaking change for majors (#180) (@lukekarrys)

### Bug Fixes

* [`0e95298`](https://github.com/npm/template-oss/commit/0e952980f78b72097123b157cb220bd6c44b5199) [#214](https://github.com/npm/template-oss/pull/214) properly quote strings with exclamation marks (#214) (@lukekarrys)
* [`99f3945`](https://github.com/npm/template-oss/commit/99f394564552d43cd97becb5431daef0c3c0e464) [#210](https://github.com/npm/template-oss/pull/210) make tap test-ignore a regex instead of a glob (#210) (@lukekarrys)
* [`e19ebc3`](https://github.com/npm/template-oss/commit/e19ebc3270f3e563e206e474c9e0cff3c7dcd742) [#209](https://github.com/npm/template-oss/pull/209) properly ignore workspace paths from root during ci (#209) (@lukekarrys)

## [4.3.2](https://github.com/npm/template-oss/compare/v4.3.1...v4.3.2) (2022-09-19)

### Bug Fixes

* [`5fededb`](https://github.com/npm/template-oss/commit/5fededb16da81db88b56db663466d968471df973) [#207](https://github.com/npm/template-oss/pull/207) workspace can use only latest ci version of root (@lukekarrys)

## [4.3.1](https://github.com/npm/template-oss/compare/v4.3.0...v4.3.1) (2022-09-19)

### Bug Fixes

* [`817d49e`](https://github.com/npm/template-oss/commit/817d49e3d64f76ce2fd6d1d765044908bd2af022) [#205](https://github.com/npm/template-oss/pull/205) remove 'All' from regular test job name (@lukekarrys)

## [4.3.0](https://github.com/npm/template-oss/compare/v4.2.0...v4.3.0) (2022-09-19)

### Features

* [`3640080`](https://github.com/npm/template-oss/commit/36400808bf9da35e10aab0c6663fb284624b8dd6) add checks to release pull request (@lukekarrys)
* [`5b65537`](https://github.com/npm/template-oss/commit/5b655374771b62c572800dd56f44c102f863ba73) add names to all jobs and steps (@lukekarrys)
* [`caf393c`](https://github.com/npm/template-oss/commit/caf393c6d01b7608eeafe4503fb73fd47d21193c) add dependabot configuration for workspaces (@lukekarrys)
* [`e43ee70`](https://github.com/npm/template-oss/commit/e43ee70c03e41c6bc25b1938a360ccfc33a30319) [#198](https://github.com/npm/template-oss/pull/198) update codeql actions to v2 (@lukekarrys)

## [4.2.0](https://github.com/npm/template-oss/compare/v4.1.2...v4.2.0) (2022-09-15)

### Features

* [`849cecc`](https://github.com/npm/template-oss/commit/849cecce6851d644d8a0e1a153ce3d245d967d44) add `content` config option to allow a module to set own content (@lukekarrys)
* [`423450f`](https://github.com/npm/template-oss/commit/423450f9802a676a035143a1fd503403c305e79d) [#195](https://github.com/npm/template-oss/pull/195) remove postpublish from package.json (#195) (@lukekarrys)

### Bug Fixes

* [`ffa2c08`](https://github.com/npm/template-oss/commit/ffa2c08267d0807c1e341e907e1eef8b179d880b) [#189](https://github.com/npm/template-oss/pull/189) dont run workflows outside of npm org (#194) (@lukekarrys)

## [4.1.2](https://github.com/npm/template-oss/compare/v4.1.1...v4.1.2) (2022-09-14)

### Bug Fixes

* [`6bc355a`](https://github.com/npm/template-oss/commit/6bc355a2b313bdde0fd6fe7cdf0c290ebf747af9) [#192](https://github.com/npm/template-oss/pull/192) set package.json version from release please (#192) (@lukekarrys)

## [4.1.1](https://github.com/npm/template-oss/compare/v4.1.0...v4.1.1) (2022-09-13)

### Bug Fixes

* [`78a05fe`](https://github.com/npm/template-oss/commit/78a05fe8393dbf9e4d3bd43f2eff4db12921cde5) [#190](https://github.com/npm/template-oss/pull/190) pass current github ref to release please (#190) (@lukekarrys)

## [4.1.0](https://github.com/npm/template-oss/compare/v4.0.0...v4.1.0) (2022-09-13)

### Features

* [`352d332`](https://github.com/npm/template-oss/commit/352d33210a89deee6b85ce6e8d9650054177e10f) [#187](https://github.com/npm/template-oss/pull/187) add release branches config to release-please workflow (#187) (@lukekarrys)

### Bug Fixes

* [`b58d86a`](https://github.com/npm/template-oss/commit/b58d86adc26d3d6fc07c682391a597398dd3a5b3) [#183](https://github.com/npm/template-oss/pull/183) use conventional commits from release-please for changelog (#183) (@lukekarrys)

## [4.0.0](https://github.com/npm/template-oss/compare/v3.8.1...v4.0.0) (2022-09-08)

### ⚠ BREAKING CHANGES

* this updates this package and the templated engines for node to `^14.17.0 || ^16.13.0 || >=18.0.0`

### Features

  * [`a72774a`](https://github.com/npm/template-oss/commit/a72774aa4cd4ad74df5f85b2793d8408688507da) [#184](https://github.com/npm/template-oss/pull/184) feat: update engines to `^14.17.0 || ^16.13.0 || >=18.0.0` (@lukekarrys)

## [3.8.1](https://github.com/npm/template-oss/compare/v3.8.0...v3.8.1) (2022-09-01)

### Bug Fixes

  * [`70782b3`](https://github.com/npm/template-oss/commit/70782b3677e40472260853df92d3ca8b805af422) [#179](https://github.com/npm/template-oss/pull/179) fix: update a few release nits after trying it on the cli (@lukekarrys)

## [3.8.0](https://github.com/npm/template-oss/compare/v3.7.1...v3.8.0) (2022-08-31)

### Features

  * [`7562777`](https://github.com/npm/template-oss/commit/75627773c0afd3e9dbe5c176a797f363d81208f3) [#174](https://github.com/npm/template-oss/pull/174) feat: use custom release please script (@lukekarrys)

### Bug Fixes

  * [`0f44075`](https://github.com/npm/template-oss/commit/0f440750cbe55c02df5c2b8a479d51bd895ce17f) [#175](https://github.com/npm/template-oss/pull/175) fix: only add release please workspace plugins to monorepos (@lukekarrys)

## [3.7.1](https://github.com/npm/template-oss/compare/v3.7.0...v3.7.1) (2022-08-25)


### Bug Fixes

* add tap matcher to workspaces ([ce977c4](https://github.com/npm/template-oss/commit/ce977c4737476ed84d2d5c5f584daab7d1c780c6))
* remove unnecessary if statement in release please action ([678cb5a](https://github.com/npm/template-oss/commit/678cb5acb93206568a5b7e07d5bd41a669d7db8b))

## [3.7.0](https://github.com/npm/template-oss/compare/v3.6.0...v3.7.0) (2022-08-25)


### Features

* use release please manifest configuration ([#164](https://github.com/npm/template-oss/issues/164)) ([95118ec](https://github.com/npm/template-oss/commit/95118ec0704162c1c25f3ccc0099ac972bfd752a))


### Bug Fixes

* default root component to empty string to match previous behavior ([#166](https://github.com/npm/template-oss/issues/166)) ([0f2a89f](https://github.com/npm/template-oss/commit/0f2a89f6fa55e918cab151af11e96a256ecd5a7e))
* remove old release please files ([#170](https://github.com/npm/template-oss/issues/170)) ([09d955f](https://github.com/npm/template-oss/commit/09d955f3dbc68e16cbe34d018d6197a06bc66727))

## [3.6.0](https://github.com/npm/template-oss/compare/v3.5.0...v3.6.0) (2022-08-22)


### Features

* add a problem matcher for tap output ([#160](https://github.com/npm/template-oss/issues/160)) ([8176e44](https://github.com/npm/template-oss/commit/8176e44f9764e09e7d5c52c2aadfc1c0ca228af3))
* make cron workflows run early PT ([#159](https://github.com/npm/template-oss/issues/159)) ([6f571eb](https://github.com/npm/template-oss/commit/6f571eb93c2c101926a8dae7b7160e981c208ab7))


### Bug Fixes

* compare to \n instead of os.EOL ([#157](https://github.com/npm/template-oss/issues/157)) ([5517e9e](https://github.com/npm/template-oss/commit/5517e9eb0f081217423a2c193eabe2496c08eaab))
* pin yaml to 2.0.0-11 ([#161](https://github.com/npm/template-oss/issues/161)) ([e095275](https://github.com/npm/template-oss/commit/e095275f229c66d8820f4edc5b801ceee60538df))
* remove more usage of os.EOL ([#162](https://github.com/npm/template-oss/issues/162)) ([4dde648](https://github.com/npm/template-oss/commit/4dde648deb0d880d12f8810914309a9aa0947010))

## [3.5.0](https://github.com/npm/template-oss/compare/v3.4.3...v3.5.0) (2022-05-11)


### Features

* add CODE_OF_CONDUCT.md ([#146](https://github.com/npm/template-oss/issues/146)) ([ad8c6fc](https://github.com/npm/template-oss/commit/ad8c6fc7bd06bb9edb3b44619d9bf5fc306bcb0b))


### Bug Fixes

* update bot account information ([#147](https://github.com/npm/template-oss/issues/147)) ([f802204](https://github.com/npm/template-oss/commit/f802204efa59a30a138d2338c478e357562b7fb1))

### [3.4.3](https://github.com/npm/template-oss/compare/v3.4.2...v3.4.3) (2022-05-03)


### Bug Fixes

* add 'use strict' to .eslintrc.js ([#141](https://github.com/npm/template-oss/issues/141)) ([6486967](https://github.com/npm/template-oss/commit/64869675f597eaf96e491b19edb8718db9939352))

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
