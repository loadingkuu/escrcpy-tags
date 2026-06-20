import { defineStore } from 'pinia'
import dayjs from 'dayjs'
import { capitalize } from 'lodash-es'
import { name as packageName } from '$root/package.json'
import {
  getCurrentDevices,
  getHistoryDevices,
  mergeDevices,
  saveDevicesToStore,
} from './helpers/index.js'

const $electronStore = window.$preload.store

export const useDeviceStore = defineStore('app-device', () => {
  const list = ref([])
  const config = ref({})

  function init() {
    config.value = {
      ...($electronStore.get('device') || {}),
    }
    return config.value
  }

  function getLabel(device, params) {
    const data = device?.id
      ? device
      : list.value.find(item => item.id === device)

    if (!data) {
      return ''
    }

    const appName = capitalize(packageName)
    const deviceSerial = data.id.replaceAll(/[<>:"/\\|?*]/g, '_')
    const deviceName = `${data.remark || data.name}[${deviceSerial}]`
    const currentTime = dayjs().format('YYYYMMDDHHmmss')
    let value = `${deviceName}-${appName}`

    const createPreset = type => `${deviceName}-${capitalize(type)}-${appName}`

    const presets = {
      screenshot: `${deviceName}-Screenshot-${currentTime}`,
      name: deviceName,
    }

    if (typeof params === 'function') {
      value = params({
        data,
        appName,
        deviceName,
        currentTime,
      })
    }
    else if (params && typeof params === 'string') {
      value = presets[params] || createPreset(params)
    }

    return value
  }

  async function getList() {
    const historyDevices = getHistoryDevices()
    const currentDevices = await getCurrentDevices()
    const mergedDevices = mergeDevices(historyDevices, currentDevices)
    mergedDevices.forEach(sanitizeDeviceTags)
    saveDevicesToStore(mergedDevices)
    list.value = mergedDevices
    return mergedDevices
  }

  // Drop legacy/invalid tag entries (e.g. string ids from the old shared-pool
  // model) and keep the current-tag pointer valid. Persists the cleanup.
  function sanitizeDeviceTags(device) {
    if (!device?.tags)
      return

    const clean = (Array.isArray(device.tags) ? device.tags : []).filter(
      item => item && typeof item === 'object' && typeof item.name === 'string' && item.name.length > 0,
    )

    if (clean.length !== device.tags.length) {
      device.tags = clean
      $electronStore.set(['device', device.id, 'tags'], clean)
    }

    if (device.currentTag && !clean.some(item => item.id === device.currentTag)) {
      device.currentTag = clean[0]?.id || null
      $electronStore.set(['device', device.id, 'currentTag'], device.currentTag)
    }
  }

  function setRemark(deviceId, value) {
    $electronStore.set(['device', deviceId, 'remark'], value)
    init()
  }

  function getDevice(deviceId) {
    return list.value.find(item => item.id === deviceId)
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  }

  // Tags are independent per device: device.tags is an array of
  // { id, name, color } objects; device.currentTag is the active tag id.
  function persistTags(deviceId, tags) {
    // Strip Vue reactivity to plain objects — reactive proxies can't be
    // structured-cloned over IPC ("An object could not be cloned").
    const plain = (tags || []).map(item => ({
      id: item.id,
      name: item.name,
      color: item.color,
    }))

    $electronStore.set(['device', deviceId, 'tags'], plain)
    const device = getDevice(deviceId)
    if (device) {
      device.tags = plain
    }
  }

  /**
   * Mark one of a device's tags as the current one (highlighted)
   */
  function setCurrentTag(deviceId, tagId = null) {
    $electronStore.set(['device', deviceId, 'currentTag'], tagId)
    const device = getDevice(deviceId)
    if (device) {
      device.currentTag = tagId
    }
  }

  /**
   * Create a new tag on a single device
   */
  function addDeviceTag(deviceId, { name, color } = {}) {
    const device = getDevice(deviceId)
    const tag = { id: uid(), name: (name || '').trim(), color }
    const tags = [...(device?.tags || []), tag]

    persistTags(deviceId, tags)

    if (!device?.currentTag) {
      setCurrentTag(deviceId, tag.id)
    }

    return tag
  }

  /**
   * Remove a tag from a single device
   */
  function removeDeviceTag(deviceId, tagId) {
    const device = getDevice(deviceId)
    const tags = (device?.tags || []).filter(item => item.id !== tagId)

    persistTags(deviceId, tags)

    if (device?.currentTag === tagId) {
      setCurrentTag(deviceId, tags[0]?.id || null)
    }
  }

  return {
    list,
    config,
    init,
    getLabel,
    getList,
    setRemark,
    getDevice,
    setCurrentTag,
    addDeviceTag,
    removeDeviceTag,
  }
})
