import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import mermaid from 'mermaid'

mermaid.initialize({ startOnLoad: false, theme: 'dark', suppressErrors: true })

function MermaidChart({ chart }) {
  const containerRef = useRef(null)
  const [rendered, setRendered] = useState(false)

  useEffect(() => {
    if (!containerRef.current || !chart) return
    let cancelled = false
    const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2)}`

    mermaid.render(id, chart)
      .then(({ svg }) => {
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg
          setRendered(true)
        }
      })
      .catch(() => { if (!cancelled) setRendered(false) })

    return () => { cancelled = true }
  }, [chart])

  return <div ref={containerRef} className="mermaid-chart" style={{ display: rendered ? 'flex' : 'none' }} />
}

function NotesViewer({ notes, diagrams }) {
  const diagramMap = Object.fromEntries((diagrams || []).map(d => [d.id.trim(), d.mermaid]))
  const parts = notes.split(/(\[DIAGRAM:[^\]]+\])/)

  return (
    <div className="notes-viewer">
      {parts.map((part, i) => {
        const match = part.match(/\[DIAGRAM:([^\]]+)\]/)
        if (match) {
          const d = diagramMap[match[1].trim()]
          return d ? <MermaidChart key={i} chart={d} /> : null
        }
        return (
          <div key={i} className="notes-markdown">
            <ReactMarkdown>{part}</ReactMarkdown>
          </div>
        )
      })}
    </div>
  )
}

export default NotesViewer
