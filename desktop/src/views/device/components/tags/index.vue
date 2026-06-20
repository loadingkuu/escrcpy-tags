<template>
  <div class="flex items-center gap-2 flex-wrap">
    <!-- This device's own tags. Click a chip to make it the current one. -->
    <span
      v-for="tag of orderedTags"
      :key="tag.id"
      :style="tagStyle(tag)"
      class="tag-chip"
      :class="isCurrent(tag.id) ? 'tag-chip--current' : ''"
      :title="$t('device.tags.setCurrent')"
      @click="setCurrent(tag.id)"
    >
      <el-icon v-if="isCurrent(tag.id)" class="flex-none text-[0.85em]">
        <StarFilled />
      </el-icon>
      <span>{{ tag.name }}</span>
    </span>

    <!-- Manage this device's tags only (create / set current / delete) -->
    <el-popover
      placement="bottom-start"
      :width="240"
      trigger="click"
      @show="onShow"
    >
      <template #reference>
        <span class="tag-chip tag-chip--add" :title="$t('device.tags.name')">
          <el-icon><Plus /></el-icon>
          <span>{{ $t('device.tags.name') }}</span>
        </span>
      </template>

      <div>
        <div class="text-xs text-gray-400 mb-1 px-1 truncate">
          {{ device.remark || device.name || device.id }} · {{ $t('device.tags.name') }}
        </div>

        <div v-if="tags.length" class="max-h-52 overflow-auto -mx-1">
          <div
            v-for="tag of tags"
            :key="tag.id"
            class="group flex items-center justify-between px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <div
              class="flex items-center space-x-2 cursor-pointer flex-1 min-w-0"
              @click="setCurrent(tag.id)"
            >
              <span class="w-3 h-3 rounded-full flex-none" :style="{ backgroundColor: tag.color }"></span>
              <span class="truncate" :class="isCurrent(tag.id) ? 'font-medium' : ''">{{ tag.name }}</span>
            </div>

            <div class="flex items-center space-x-2 flex-none pl-2">
              <el-icon
                class="cursor-pointer transition-opacity"
                :class="isCurrent(tag.id)
                  ? 'text-yellow-400'
                  : 'text-gray-300 opacity-0 group-hover:opacity-100 hover:text-yellow-400'"
                :title="$t('device.tags.setCurrent')"
                @click="setCurrent(tag.id)"
              >
                <component :is="isCurrent(tag.id) ? 'StarFilled' : 'Star'" />
              </el-icon>

              <el-icon
                class="cursor-pointer text-gray-300 opacity-0 group-hover:opacity-100 hover:text-red-500"
                :title="$t('common.delete')"
                @click="removeTag(tag)"
              >
                <Close />
              </el-icon>
            </div>
          </div>
        </div>

        <el-empty v-else :description="$t('device.tags.empty')" :image-size="40" />

        <el-divider class="!my-2" />

        <div class="flex items-center space-x-1">
          <el-color-picker v-model="newColor" :predefine="presetTagColors" size="small" />
          <el-input
            v-model="newName"
            size="small"
            :placeholder="$t('device.tags.new.placeholder')"
            @keyup.enter="createTag"
          ></el-input>
          <el-button type="primary" size="small" icon="Plus" @click="createTag"></el-button>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script>
import { presetTagColors } from '$/store/tag/index.js'

function hexToRgba(hex, alpha) {
  const value = (hex || '').replace('#', '')
  const full = value.length === 3
    ? value.split('').map(c => c + c).join('')
    : value
  const int = Number.parseInt(full, 16)
  const r = (int >> 16) & 255
  const g = (int >> 8) & 255
  const b = int & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default {
  props: {
    device: {
      type: Object,
      default: () => ({}),
    },
    size: {
      type: String,
      default: 'small',
    },
  },
  setup() {
    const deviceStore = useDeviceStore()

    return {
      deviceStore,
      presetTagColors,
    }
  },
  data() {
    return {
      newName: '',
      newColor: presetTagColors[0],
    }
  },
  computed: {
    tags() {
      // Guard against legacy/invalid entries (e.g. old string-id tags) so they
      // don't render as blank, unclickable chips.
      return (this.device.tags || []).filter(
        item => item && typeof item === 'object' && typeof item.name === 'string' && item.name.length > 0,
      )
    },
    orderedTags() {
      // Current tag first so it always moves to the front
      return [...this.tags].sort((a, b) => {
        return Number(this.isCurrent(b.id)) - Number(this.isCurrent(a.id))
      })
    },
  },
  methods: {
    isCurrent(id) {
      return this.device.currentTag === id
    },
    tagStyle(tag) {
      if (this.isCurrent(tag.id)) {
        return {
          backgroundColor: tag.color,
          borderColor: tag.color,
          color: '#fff',
          boxShadow: `0 2px 8px ${hexToRgba(tag.color, 0.4)}`,
        }
      }

      return {
        color: tag.color,
        borderColor: hexToRgba(tag.color, 0.28),
        backgroundColor: hexToRgba(tag.color, 0.12),
      }
    },
    setCurrent(id) {
      this.deviceStore.setCurrentTag(this.device.id, id)
    },
    createTag() {
      const name = this.newName.trim()
      if (!name) {
        return false
      }

      this.deviceStore.addDeviceTag(this.device.id, { name, color: this.newColor })
      this.newName = ''
      // Cycle the default color so successive tags differ
      const next = (presetTagColors.indexOf(this.newColor) + 1) % presetTagColors.length
      this.newColor = presetTagColors[next]
    },
    async removeTag(tag) {
      try {
        await ElMessageBox.confirm(
          this.$t('device.tags.remove.confirm', { name: tag.name }),
          this.$t('common.tips'),
          { type: 'warning' },
        )
      }
      catch {
        return false
      }

      this.deviceStore.removeDeviceTag(this.device.id, tag.id)
    },
    onShow() {},
  },
}
</script>

<style lang="postcss" scoped>
.tag-chip {
  @apply inline-flex items-center gap-1 select-none cursor-pointer;
  @apply px-2.5 py-1 rounded-full border text-xs font-medium leading-none;
  @apply transition-all duration-200;
}

.tag-chip:hover {
  @apply -translate-y-px;
  filter: brightness(1.03);
}

.tag-chip:active {
  @apply translate-y-0;
}

.tag-chip--current {
  @apply font-semibold;
}

.tag-chip--add {
  @apply border-dashed text-gray-400 bg-transparent;
  @apply hover:text-primary-500 hover:border-primary-400;
}

.tag-chip--add:hover {
  filter: none;
}
</style>
