'use strict'

// TODO check fragments, alias
function graphqlSelectionFields (info, name) {
  let nodes = info.fieldNodes
  let node
  while (nodes) {
    node = nodes.find(node => node.name.value === name)
    if (node) {
      return node.selectionSet.selections.map(selection => selection.name.value)
    }
    nodes = nodes.map(n => n.selectionSet.selections).flat()
  }
}

module.exports = {
  graphqlSelectionFields
}
