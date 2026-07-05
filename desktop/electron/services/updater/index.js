import { devPublishPath } from '$electron/configs/index.js'
import { t } from '$electron/helpers/i18n/index.js'
import { is } from '@electron-toolkit/utils'
import { app, dialog, ipcMain } from 'electron'
import electronUpdater from 'electron-updater'

const { autoUpdater } = electronUpdater

export default {
  name: 'service:updater',
  apply(mainApp) {
    if (is.dev) {
      autoUpdater.updateConfigPath = devPublishPath
      Object.defineProperty(app, 'isPackaged', {
        get() {
          return true
        },
      })
    }

    // 本 Fork 采用 2.11.1-tags.N 预发布版本号（保持上游 2.11.1 基线 + 递增后缀）。
    // electron-updater 默认会过滤掉 semver 预发布版本，必须显式允许才能识别 -tags 版本。
    autoUpdater.allowPrerelease = true

    // 是否为「启动时静默自动检查」。静默检查发现新版用原生弹窗提示；
    // 用户在关于页手动检查时则沿用渲染层的更新弹窗（带发行说明）。
    let silentCheck = false

    // 手动检查更新（来自关于页按钮）
    ipcMain.on('check-for-update', () => {
      silentCheck = false
      autoUpdater.checkForUpdates()
    })

    // 下载更新
    ipcMain.on('download-update', () => {
      autoUpdater.downloadUpdate()
    })

    // 安装更新
    ipcMain.on('quit-and-install', () => {
      setImmediate(() => {
        app.isQuiting = true
        autoUpdater.quitAndInstall()
      })
    })

    // 关闭自动下载（默认 true — 发现更新后自动下载）
    autoUpdater.autoDownload = false

    // 更新错误处理
    autoUpdater.on('error', (error) => {
      console.error('update-error', error)
      // 静默检查阶段（如无网络）不打扰用户，仅记录日志
      if (silentCheck) {
        return
      }
      const mainWindow = mainApp.getMainWindow()
      mainWindow?.webContents?.send('update-error', error)
    })

    // 正在检查更新
    autoUpdater.on('checking-for-update', (ret) => {
      console.log('checking-for-update', ret)
    })

    // 发现可用更新
    autoUpdater.on('update-available', (ret) => {
      const mainWindow = mainApp.getMainWindow()

      if (silentCheck) {
        // 启动自动检查：用原生弹窗询问是否下载
        dialog
          .showMessageBox(mainWindow, {
            type: 'info',
            title: t('about.update-available.title'),
            message: t('about.update-available.title'),
            detail: `v${ret?.version || ''}`,
            buttons: [t('about.update-available.confirm'), t('common.cancel')],
            defaultId: 0,
            cancelId: 1,
          })
          .then(({ response }) => {
            if (response === 0) {
              autoUpdater.downloadUpdate()
            }
          })
        return
      }

      mainWindow?.webContents?.send('update-available', ret)
    })

    // 无可用更新
    autoUpdater.on('update-not-available', (ret) => {
      // 静默检查时无需提示「已是最新」
      if (silentCheck) {
        return
      }
      const mainWindow = mainApp.getMainWindow()
      mainWindow?.webContents?.send('update-not-available', ret)
    })

    // 下载进度
    autoUpdater.on('download-progress', (ret) => {
      const mainWindow = mainApp.getMainWindow()
      mainWindow?.webContents?.send('download-progress', ret)
    })

    // 更新包下载完成
    autoUpdater.on('update-downloaded', (ret) => {
      const mainWindow = mainApp.getMainWindow()

      if (silentCheck) {
        // 启动自动检查下载完成：原生弹窗询问是否立即重启安装
        dialog
          .showMessageBox(mainWindow, {
            type: 'info',
            title: t('about.update-downloaded.title'),
            message: t('about.update-downloaded.message'),
            buttons: [t('about.update-downloaded.confirm'), t('common.cancel')],
            defaultId: 0,
            cancelId: 1,
          })
          .then(({ response }) => {
            if (response === 0) {
              app.isQuiting = true
              autoUpdater.quitAndInstall()
            }
          })
        return
      }

      mainWindow?.webContents?.send('update-downloaded', ret)
    })

    // 启动后静默自动检查一次更新（延迟几秒，等窗口就绪；便携版无法自更新会静默失败）
    setTimeout(() => {
      if (is.dev) {
        return
      }
      silentCheck = true
      autoUpdater.checkForUpdates()
    }, 5000)
  },
}
