import type {Node as ProseMirrorNode, Slice} from '@tiptap/pm/model'

// Serializes a copied slice to plain text while keeping list markers.
// ProseMirror's default text serializer only joins the text content, which drops
// the bullets and numbers of a copied list.
export function serializeSliceAsText(slice: Slice): string {
	const parts: string[] = []
	slice.content.forEach(node => parts.push(serializeNode(node)))
	return parts.join('\n\n')
}

function serializeNode(node: ProseMirrorNode): string {
	if (node.isText) {
		return node.text ?? ''
	}

	if (node.type.name === 'bulletList') {
		return serializeListItems(node, () => '- ')
	}

	if (node.type.name === 'orderedList') {
		const start = Number(node.attrs.start ?? 1)
		return serializeListItems(node, index => `${start + index}. `)
	}

	if (node.isTextblock) {
		return node.textBetween(0, node.content.size, '\n')
	}

	const children: string[] = []
	node.forEach(child => children.push(serializeNode(child)))
	return children.join('\n')
}

function serializeListItems(list: ProseMirrorNode, marker: (index: number) => string): string {
	const items: string[] = []
	list.forEach((item, _offset, index) => {
		const lines = serializeNode(item).split('\n')
		const prefix = marker(index)
		const indent = ' '.repeat(prefix.length)
		items.push(lines.map((line, lineIndex) => (lineIndex === 0 ? prefix : indent) + line).join('\n'))
	})
	return items.join('\n')
}
