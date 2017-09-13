/* global BP_EDITION */

import Promise from 'bluebird'
import express from 'express'
import path from 'path'
import fs from 'fs'
import ms from 'ms'
import util from '../util'

module.exports = bp => {

  function serveModule(app, module) {
    const name = module.name
    const shortName = module.name.replace(/botpress-/i, '')

    if (module.settings.menuIcon === 'custom') {
      const iconRequestPath = `/img/modules/${name}.png`
      const iconPath = path.join(module.root, 'icon.png')

      app.get(iconRequestPath, (req, res) => {
        try {
          const content = fs.readFileSync(iconPath)
          res.contentType('image/png')
          res.send(content)
        } catch (err) {
          bp.logger.warn(`Could not serve module icon [${name}] at: ${iconPath}`)
        }
      })
    }

    const liteDir = path.join(module.root, module.settings.liteDir || 'bin/lite')
    const liteViews = fs.existsSync(liteDir)
      ? fs.readdirSync(liteDir).filter(b => b.endsWith('.js'))
      : []

    app.get([
      `/js/modules/${shortName}`, // The full module view
      `/js/modules/${name}.js`, // <<-- DEPRECATED: Will be removed shortly. Only use shortNames
      `/js/modules/${shortName}/:subview` // Lite view
    ], (req, res) => {
      const settingsKey = module.settings.webBundle
      let bundlePath = path.join(module.root, settingsKey || 'bin/web.bundle.js')

      if (req.params && req.params.subview) {
        // Render lite view
        bundlePath = path.join(liteDir, req.params.subview + '.bundle.js')
      }

      try {
        const content = fs.readFileSync(bundlePath)
        res.contentType('text/javascript')
        res.send(content)
      } catch (err) {
        bp.logger.warn(`Could not serve module [${name}] at: ${bundlePath}`)
        res.sendStatus(404)
      }
    })
  }

  function serveCustomTheme(app) {
    let customTheme = ''

    if (BP_EDITION !== 'lite' && bp.licensing.getFeatures().whitelabel === true) {
      const themeLocation = path.join(bp.projectLocation, 'theme.css')
      if (fs.existsSync(themeLocation)) {
        customTheme = fs.readFileSync(themeLocation)
      }
    }

    app.use('/style/custom-theme.css', (req, res) => {
      res.contentType('text/css')
      res.send(customTheme)
    })
  }

  async function install(app) {

    for (let name in bp._loadedModules) {
      const module = bp._loadedModules[name]
      serveModule(app, module)
    }

    app.use('/js/env.js', (req, res) => {
      const { tokenExpiry, enabled } = bp.botfile.login
      const optOutStats = !!bp.botfile.optOutStats
      const appName = bp.botfile.appName || 'Botpress'
      
      const { isFirstRun, version } = bp
      res.contentType('text/javascript')
      res.send(`(function(window) {
        window.NODE_ENV = "${process.env.NODE_ENV || 'development'}";
        window.DEV_MODE = ${util.isDeveloping};
        window.AUTH_ENABLED = ${enabled};
        window.AUTH_TOKEN_DURATION = ${ms(tokenExpiry)};
        window.OPT_OUT_STATS = ${optOutStats};
        window.SHOW_GUIDED_TOUR = ${isFirstRun};
        window.BOTPRESS_VERSION = "${version}";
        window.APP_NAME = "${appName}";
      })(window || {})`)
    })

    serveCustomTheme(app)

    app.use(express.static(path.join(bp.projectLocation, 'static')))
    
    app.use(express.static(path.join(__dirname, '../lib/web')))

    app.get('*', (req, res, next) => {
      if (/html/i.test(req.headers.accept)) {
        if (req.url && /^\/lite\//i.test(req.url)) {
          return res.sendFile(path.join(__dirname, '../lib/web/lite.html'))
        }
        
        return res.sendFile(path.join(__dirname, '../lib/web/index.html'))
      }
      next()
    })

    return Promise.resolve(true)
  }

  return { install }
}
