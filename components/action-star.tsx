const marks = {
  menu: 'M14 13h5m-5 3h5m-5 3h5',
  close: 'm14 13 5 5m0-5-5 5',
  copy: 'M14 12h4v6h-6v-3',
  back: 'M7 12H1m0 0 3-3m-3 3 3 3',
  remove: 'M13 15h6',
  add: 'M16 12v6m-3-3h6',
  search: 'm13 13 5 5',
  history: 'M15 3a7 7 0 0 1 1 13m0 0 3-1m-3 1v-3',
  send: 'm12 15 2 2 5-6',
  notify: 'M16 4l2-2m-1 6h3',
} as const;

export function ActionStar({action}:{action:keyof typeof marks}) {
  return <svg className="action-star" aria-hidden="true" viewBox="0 0 20 20"
    fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
    <path d={action === 'back' ? 'm13 3 1.6 4.1 4.4.3-3.4 2.8 1.1 4.3-3.7-2.4-3.7 2.4 1.1-4.3L7 7.4l4.4-.3z' : 'm8 2 1.8 4.4 4.7.3-3.6 3 1.2 4.6L8 11.7l-4.1 2.6 1.2-4.6-3.6-3 4.7-.3z'}/>
    <path d={marks[action]}/>
  </svg>;
}
