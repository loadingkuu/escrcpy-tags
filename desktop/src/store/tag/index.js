/**
 * Preset color palette offered when creating a tag.
 *
 * Tags are stored per-device (see the device store: `device.<id>.tags` is an
 * array of { id, name, color } objects and `device.<id>.currentTag` is the
 * active tag id). There is intentionally no shared/global tag pool — every
 * phone keeps its own independent set of tags.
 */
export const presetTagColors = [
  '#0F8C79',
  '#409EFF',
  '#E6A23C',
  '#F56C6C',
  '#909399',
  '#9C27B0',
  '#FF7043',
  '#26A69A',
  '#5C6BC0',
  '#EC407A',
]
