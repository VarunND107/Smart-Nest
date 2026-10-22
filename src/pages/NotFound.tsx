import { ButtonLink } from '../components/ui'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="text-sm font-semibold text-brand-700">404</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">We couldn't find that page</h1>
      <p className="mt-2 text-slate-600">The link may be old, or the address mistyped.</p>
      <div className="mt-6 flex justify-center gap-3">
        <ButtonLink to="/">Go home</ButtonLink>
        <ButtonLink to="/learn" variant="secondary">
          Browse guides
        </ButtonLink>
      </div>
    </div>
  )
}
