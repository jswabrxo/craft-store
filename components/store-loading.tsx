export function StoreLoading({error}: {error?:string}) {
  return <main className="store-loading" role={error ? 'alert' : 'status'}>
    <strong>ODD OBJECTS</strong>
    <p>{error || 'Opening the rack…'}</p>
    {error && <button type="button" onClick={()=>window.location.reload()}>Try again</button>}
  </main>;
}
