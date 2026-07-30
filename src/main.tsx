import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

function restoreGitHubPagesPath() {
  const params = new URLSearchParams(window.location.search)
  const redirectPath = params.get('p')

  if (!redirectPath) {
    return
  }

  const decodedPath = decodeURIComponent(redirectPath)
  const [pathPart = '/', searchPart = ''] = decodedPath.split('?')
  const cleanPath = pathPart.startsWith('/') ? pathPart : `/${pathPart}`
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '')
  const target = new URL(`${basePath}${cleanPath === '/' ? '' : cleanPath}`, window.location.origin)

  if (searchPart) {
    target.search = searchPart
  }

  window.history.replaceState(null, '', `${target.pathname}${target.search}${target.hash}`)
}

restoreGitHubPagesPath()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
