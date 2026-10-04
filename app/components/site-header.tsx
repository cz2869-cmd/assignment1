import AuthButton from '../auth-button'

export default function SiteHeader() {
  return (
    <header className="siteHeader">
      <a className="logo" href="/">
        <span className="logoMark" aria-hidden="true">
          ☕
        </span>
        Morningside Nook
      </a>
      <AuthButton />
    </header>
  )
}
