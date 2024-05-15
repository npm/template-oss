const t = require('tap')
const setup = require('../setup.js')

t.test('ok with required', async t => {
  const s = await setup(t, {
    ok: true,
  })
  await s.apply()
  t.strictSame(await s.check(), [])
})

t.test('required in each location', async t => {
  const s = await setup(t, {
    package: {
      dependencies: {
        a: '^100.0.0',
        // pinned is ok if requesting a range
        d: '5.0.0',
      },
      devDependencies: {
        b: '^4.5.0',
      },
      peerDependencies: {
        c: '1.2.3',
      },
      templateOSS: {
        requiredPackages: {
          dependencies: [
            'a', // any version
            'd',
          ],
          devDependencies: [
            'b@4', // range
          ],
          peerDependencies: [
            'c@1.2.3', // pinned
          ],
        },
      },
    },
  })

  await s.apply()
  t.strictSame(await s.check(), [])
})

t.test('can be pinned', async t => {
  const config = {
    templateOSS: {
      requiredPackages: {
        devDependencies: ['a@1.0.0'],
      },
    },
  }

  await t.test('ok', async t => {
    const s = await setup(t, {
      package: {
        devDependencies: {
          a: '1.0.0',
        },
        ...config,
      },
    })

    await s.apply()
    t.strictSame(await s.check(), [])
  })

  await t.test('not ok', async t => {
    const s = await setup(t, {
      package: {
        devDependencies: {
          a: '^1.0.0',
        },
        ...config,
      },
    })

    await s.apply()
    const [res] = await s.check()
    t.strictSame(res.body, ['a@1.0.0'])
    t.strictSame(res.solution, 'npm rm a && npm i a@1.0.0 --save-dev --save-exact')
  })
})
